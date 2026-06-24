const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/users - list all users
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT user_id, national_id, first_name, last_name, birth_date, phone FROM user ORDER BY user_id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
  }
});

// DELETE /api/users/:id - delete a user
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM user WHERE user_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้ที่ต้องการลบ' });
    }

    res.json({ message: 'ลบผู้ใช้สำเร็จ' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบผู้ใช้' });
  }
});

module.exports = router;
