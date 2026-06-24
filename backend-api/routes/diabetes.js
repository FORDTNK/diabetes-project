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
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

function normalizeImagesFromBody(bodyImages) {
  if (!bodyImages) return [];
  if (Array.isArray(bodyImages)) return bodyImages;
  if (typeof bodyImages !== 'string') return [];

  try {
    const parsed = JSON.parse(bodyImages);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function imageRowsFromFiles(files = []) {
  return files.map((file) => ({ image_name: file.filename }));
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
router.post('/', authMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    const { user_id, title, topic, content } = req.body;
    const images = [
      ...normalizeImagesFromBody(req.body.images),
      ...imageRowsFromFiles(req.files)
    ];
    const admin_id = req.admin.admin_id;

    const [result] = await pool.query(
      'INSERT INTO diabetes_info (user_id, title, topic, content, admin_id) VALUES (?, ?, ?, ?, ?)',
      [user_id || null, title, topic, content, admin_id]
    );

    const diabetes_id = result.insertId;

    // Insert images if provided
    if (images && images.length > 0) {
      const imageValues = images.map(img => [diabetes_id, img.image_name]);
      await pool.query(
        'INSERT INTO image (diabetes_id, image_name) VALUES ?',
        [imageValues]
      );
    }

    res.status(201).json({ message: 'เพิ่มข้อมูลเบาหวานสำเร็จ', diabetes_id });
  } catch (err) {
    console.error('Create diabetes error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล' });
  }
});

// PUT /api/diabetes/:id - update
router.put('/:id', authMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    const { user_id, title, topic, content } = req.body;
    const hasMultipartImages = req.files && req.files.length > 0;
    const hasExistingImages = req.body.existingImages !== undefined;
    const hasJsonImages = req.body.images !== undefined;
    const images = [
      ...normalizeImagesFromBody(req.body.existingImages),
      ...normalizeImagesFromBody(req.body.images),
      ...imageRowsFromFiles(req.files)
    ];

    const [result] = await pool.query(
      'UPDATE diabetes_info SET user_id = ?, title = ?, topic = ?, content = ? WHERE diabetes_id = ?',
      [user_id || null, title, topic, content, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลที่ต้องการแก้ไข' });
    }

    // Update images when the request explicitly sends image data.
    if (hasExistingImages || hasJsonImages || hasMultipartImages) {
      await pool.query('DELETE FROM image WHERE diabetes_id = ?', [req.params.id]);
      if (images && images.length > 0) {
        const imageValues = images.map(img => [parseInt(req.params.id), img.image_name]);
        await pool.query(
          'INSERT INTO image (diabetes_id, image_name) VALUES ?',
          [imageValues]
        );
      }
    }

    res.json({ message: 'แก้ไขข้อมูลเบาหวานสำเร็จ' });
  } catch (err) {
    console.error('Update diabetes error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' });
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
