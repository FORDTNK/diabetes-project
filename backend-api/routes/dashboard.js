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

const WAGNER_LABELS = {
  '0': 'Wagner 0',
  '1': 'Wagner 1',
  '2': 'Wagner 2',
  '3': 'Wagner 3',
  '4': 'Wagner 4',
  '5': 'Wagner 5',
};

// GET /api/dashboard/wound-class-chart
router.get('/wound-class-chart', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ah.class_id, ah.wound_position, COUNT(*) AS count
      FROM analysis_history ah
      INNER JOIN (
        SELECT user_id, MAX(id) AS latest_id
        FROM analysis_history ah1
        INNER JOIN (
          SELECT user_id, MAX(created_at) AS max_created
          FROM analysis_history
          GROUP BY user_id
        ) mc ON ah1.user_id = mc.user_id AND ah1.created_at = mc.max_created
        GROUP BY user_id
      ) latest ON ah.id = latest.latest_id
      GROUP BY ah.class_id, ah.wound_position
      ORDER BY CAST(ah.class_id AS UNSIGNED), ah.wound_position
    `);

    const classMap = {};
    let totalUsers = 0;

    rows.forEach((row) => {
      const classId = row.class_id != null ? String(row.class_id).trim() : '';
      const key = classId || 'unknown';
      classMap[key] = (classMap[key] || 0) + Number(row.count);
      totalUsers += Number(row.count);
    });

    const data = Object.entries(classMap)
      .map(([classId, count]) => ({
        class_id: classId,
        label: WAGNER_LABELS[classId] || (classId === 'unknown' ? 'ไม่ระบุระดับ' : `Wagner ${classId}`),
        count,
      }))
      .sort((a, b) => {
        if (a.class_id === 'unknown') return 1;
        if (b.class_id === 'unknown') return -1;
        return Number(a.class_id) - Number(b.class_id);
      });

    res.json({ total_users: totalUsers, data });
  } catch (err) {
    console.error('Wound class chart error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลกราฟ' });
  }
});

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
