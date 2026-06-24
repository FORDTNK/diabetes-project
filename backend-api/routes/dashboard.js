const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const uploadsDir = path.join(__dirname, '../../uploads');
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']);

async function countUploadImages() {
  try {
    const files = await fs.readdir(uploadsDir, { withFileTypes: true });
    return files.filter((file) => {
      return file.isFile() && imageExtensions.has(path.extname(file.name).toLowerCase());
    }).length;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return 0;
    }
    throw err;
  }
}

// GET /api/dashboard/stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT COUNT(*) as count FROM user');
    const [diabetesInfo] = await pool.query('SELECT COUNT(*) as count FROM diabetes_info');
    const [treatments] = await pool.query('SELECT COUNT(*) as count FROM treatment_guideline');
    const images = await countUploadImages();
    const [admins] = await pool.query('SELECT COUNT(*) as count FROM admin');

    res.json({
      users: users[0].count,
      diabetes_info: diabetesInfo[0].count,
      treatments: treatments[0].count,
      images,
      admins: admins[0].count
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' });
  }
});

module.exports = router;
