const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const uploadsDir = path.join(__dirname, '../../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeName = path
      .basename(file.originalname)
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `diabetes_${Date.now()}_${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

function normalizeImagesFromBody(bodyImages) {
  if (!bodyImages) return [];
  if (Array.isArray(bodyImages)) {
    return bodyImages
      .map((image) => (typeof image === 'string' ? { image_name: image } : image))
      .filter((image) => image && image.image_name);
  }
  if (typeof bodyImages !== 'string') return [];

  try {
    const parsed = JSON.parse(bodyImages);
    return normalizeImagesFromBody(parsed);
  } catch (err) {
    return bodyImages.trim() ? [{ image_name: bodyImages.trim() }] : [];
  }
}

function imageRowsFromFiles(files = []) {
  return files.map((file) => ({ image_name: file.filename }));
}

function getRequestImages(req) {
  return [
    ...normalizeImagesFromBody(req.body.existingImages),
    ...normalizeImagesFromBody(req.body.images),
    ...imageRowsFromFiles(req.files)
  ];
}

function handleUploadErrors(handler) {
  return (req, res, next) => {
    handler(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'ไฟล์รูปภาพไม่ถูกต้อง' });
      }
      next();
    });
  };
}

// GET /api/diabetes - list all with images
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, GROUP_CONCAT(i.image_id, ':', i.image_name) as images
       FROM diabetes_info d
       LEFT JOIN image i ON d.diabetes_id = i.diabetes_id
       GROUP BY d.diabetes_id
       ORDER BY d.diabetes_id DESC`
    );

    const result = rows.map(row => ({
      ...row,
      images: row.images
        ? row.images.split(',').map(img => {
            const [image_id, image_name] = img.split(':');
            return {
              image_id: parseInt(image_id),
              image_name,
              image_url: `/uploads/${image_name}`
            };
          })
        : []
    }));

    res.json(result);
  } catch (err) {
    console.error('Get diabetes error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลเบาหวาน' });
  }
});

// GET /api/diabetes/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM diabetes_info WHERE diabetes_id = ?', [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูล' });
    }

    const [images] = await pool.query(
      'SELECT * FROM image WHERE diabetes_id = ?', [req.params.id]
    );

    res.json({
      ...rows[0],
      images: images.map((image) => ({
        ...image,
        image_url: `/uploads/${image.image_name}`
      }))
    });
  } catch (err) {
    console.error('Get diabetes error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

// POST /api/diabetes - create
router.post('/', authMiddleware, handleUploadErrors(upload.any()), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { title, topic, content } = req.body;
    const images = getRequestImages(req);
    const admin_id = req.admin.admin_id;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อเรื่อง' });
    }

    await connection.beginTransaction();

    const [result] = await connection.query(
      'INSERT INTO diabetes_info (title, topic, content, admin_id) VALUES (?, ?, ?, ?)',
      [title.trim(), topic || null, content || null, admin_id]
    );

    const diabetes_id = result.insertId;

    // Insert images if provided
    if (images && images.length > 0) {
      const imageValues = images.map(img => [diabetes_id, img.image_name]);
      await connection.query(
        'INSERT INTO image (diabetes_id, image_name) VALUES ?',
        [imageValues]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'เพิ่มข้อมูลเบาหวานสำเร็จ', diabetes_id });
  } catch (err) {
    await connection.rollback();
    console.error('Create diabetes error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล' });
  } finally {
    connection.release();
  }
});

// PUT /api/diabetes/:id - update
router.put('/:id', authMiddleware, handleUploadErrors(upload.any()), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { title, topic, content } = req.body;
    const hasMultipartImages = req.files && req.files.length > 0;
    const hasExistingImages = req.body.existingImages !== undefined;
    const hasJsonImages = req.body.images !== undefined;
    const images = getRequestImages(req);

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อเรื่อง' });
    }

    await connection.beginTransaction();

    const [result] = await connection.query(
      'UPDATE diabetes_info SET title = ?, topic = ?, content = ? WHERE diabetes_id = ?',
      [title.trim(), topic || null, content || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'ไม่พบข้อมูลที่ต้องการแก้ไข' });
    }

    // Update images when the request explicitly sends image data.
    if (hasExistingImages || hasJsonImages || hasMultipartImages) {
      await connection.query('DELETE FROM image WHERE diabetes_id = ?', [req.params.id]);
      if (images && images.length > 0) {
        const imageValues = images.map(img => [parseInt(req.params.id), img.image_name]);
        await connection.query(
          'INSERT INTO image (diabetes_id, image_name) VALUES ?',
          [imageValues]
        );
      }
    }

    await connection.commit();
    res.json({ message: 'แก้ไขข้อมูลเบาหวานสำเร็จ' });
  } catch (err) {
    await connection.rollback();
    console.error('Update diabetes error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' });
  } finally {
    connection.release();
  }
});

// DELETE /api/diabetes/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM diabetes_info WHERE diabetes_id = ?', [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลที่ต้องการลบ' });
    }

    res.json({ message: 'ลบข้อมูลเบาหวานสำเร็จ' });
  } catch (err) {
    console.error('Delete diabetes error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
  }
});

module.exports = router;
