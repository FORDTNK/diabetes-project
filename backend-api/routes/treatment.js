const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/treatment - list all guidelines
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM treatment_guideline ORDER BY guideline_id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Get treatment error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำแนะนำ' });
  }
});

// GET /api/treatment/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM treatment_guideline WHERE guideline_id = ?', [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลคำแนะนำ' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Get treatment error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

// POST /api/treatment - create
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { class_id, grade, self_care_advice, treatment_method } = req.body;
    const admin_id = req.admin.admin_id;

    const [result] = await pool.query(
      'INSERT INTO treatment_guideline (class_id, grade, self_care_advice, treatment_method, admin_id) VALUES (?, ?, ?, ?, ?)',
      [class_id, grade, self_care_advice, treatment_method, admin_id]
    );

    res.status(201).json({ message: 'เพิ่มคำแนะนำสำเร็จ', guideline_id: result.insertId });
  } catch (err) {
    console.error('Create treatment error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล' });
  }
});

// PUT /api/treatment/:id - update
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { class_id, grade, self_care_advice, treatment_method } = req.body;
    const [result] = await pool.query(
      'UPDATE treatment_guideline SET class_id = ?, grade = ?, self_care_advice = ?, treatment_method = ? WHERE guideline_id = ?',
      [class_id, grade, self_care_advice, treatment_method, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลที่ต้องการแก้ไข' });
    }

    res.json({ message: 'แก้ไขคำแนะนำสำเร็จ' });
  } catch (err) {
    console.error('Update treatment error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' });
  }
});

// DELETE /api/treatment/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM treatment_guideline WHERE guideline_id = ?', [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลที่ต้องการลบ' });
    }

    res.json({ message: 'ลบคำแนะนำสำเร็จ' });
  } catch (err) {
    console.error('Delete treatment error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
  }
});

module.exports = router;
