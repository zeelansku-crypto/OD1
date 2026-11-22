const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Helper to handle standard GET All
const handleGetAll = (table) => async (req, res) => {
    const sql = `SELECT * FROM ${table} WHERE is_active = 1 ORDER BY id ASC`;
    try {
        const result = await db.query(sql);
        res.json(result.rows);
    } catch (err) {
        console.error(`Error fetching ${table}:`, err.message);
        res.status(500).json({ error: `Failed to fetch ${table.replace('_', ' ')}` });
    }
};

// Helper for standard POST
const handleCreate = (table, codeCol, nameCol) => async (req, res) => {
    const code = req.body[codeCol];
    const name = req.body[nameCol];
    if (!code || !name) {
        return res.status(400).json({ message: 'Code and Name are required' });
    }

    const sql = `INSERT INTO ${table} (${codeCol}, ${nameCol}, is_active) VALUES ($1, $2, 1) RETURNING id`;
    try {
        const result = await db.query(sql, [code, name]);
        res.status(201).json({ id: result.rows[0].id, [codeCol]: code, [nameCol]: name, message: 'Created successfully' });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ message: 'Code must be unique' });
        }
        res.status(500).json({ message: 'Database error', error: err.message });
    }
};

// Helper for standard PUT
const handleUpdate = (table, codeCol, nameCol) => async (req, res) => {
    const code = req.body[codeCol];
    const name = req.body[nameCol];
    const { id } = req.params;

    if (!code || !name) {
        return res.status(400).json({ message: 'Code and Name are required' });
    }

    const sql = `UPDATE ${table} SET ${codeCol} = $1, ${nameCol} = $2 WHERE id = $3`;
    try {
        const result = await db.query(sql, [code, name, id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Not found' });
        res.json({ id, [codeCol]: code, [nameCol]: name, message: 'Updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
};

// Helper for standard DELETE (Soft)
const handleDelete = (table) => async (req, res) => {
    const { id } = req.params;
    const sql = `UPDATE ${table} SET is_active = 0 WHERE id = $1`;
    try {
        const result = await db.query(sql, [id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
};

// Categories
router.get('/categories', handleGetAll('category_master'));
router.post('/categories', authenticateToken, isAdmin, handleCreate('category_master', 'category_code', 'category_name'));
router.put('/categories/:id', authenticateToken, isAdmin, handleUpdate('category_master', 'category_code', 'category_name'));
router.delete('/categories/:id', authenticateToken, isAdmin, handleDelete('category_master'));

// Degrees
router.get('/degrees', handleGetAll('degree_master'));
router.post('/degrees', authenticateToken, isAdmin, handleCreate('degree_master', 'degree_code', 'degree_name'));
router.put('/degrees/:id', authenticateToken, isAdmin, handleUpdate('degree_master', 'degree_code', 'degree_name'));
router.delete('/degrees/:id', authenticateToken, isAdmin, handleDelete('degree_master'));

// Faculties
router.get('/faculties', handleGetAll('faculty_master'));
router.post('/faculties', authenticateToken, isAdmin, handleCreate('faculty_master', 'faculty_code', 'faculty_name'));
router.put('/faculties/:id', authenticateToken, isAdmin, handleUpdate('faculty_master', 'faculty_code', 'faculty_name'));
router.delete('/faculties/:id', authenticateToken, isAdmin, handleDelete('faculty_master'));

// Courses
router.get('/courses', handleGetAll('course_master'));
router.post('/courses', authenticateToken, isAdmin, handleCreate('course_master', 'course_code', 'course_name'));
router.put('/courses/:id', authenticateToken, isAdmin, handleUpdate('course_master', 'course_code', 'course_name'));
router.delete('/courses/:id', authenticateToken, isAdmin, handleDelete('course_master'));

// Subjects
router.get('/subjects', handleGetAll('subject_master'));
router.post('/subjects', authenticateToken, isAdmin, handleCreate('subject_master', 'subject_code', 'subject_name'));
router.put('/subjects/:id', authenticateToken, isAdmin, handleUpdate('subject_master', 'subject_code', 'subject_name'));
router.delete('/subjects/:id', authenticateToken, isAdmin, handleDelete('subject_master'));

// Specializations
router.get('/specializations', handleGetAll('specialization_master'));
router.post('/specializations', authenticateToken, isAdmin, handleCreate('specialization_master', 'specialization_code', 'specialization_name'));
router.put('/specializations/:id', authenticateToken, isAdmin, handleUpdate('specialization_master', 'specialization_code', 'specialization_name'));
router.delete('/specializations/:id', authenticateToken, isAdmin, handleDelete('specialization_master'));

// Mediums
router.get('/mediums', handleGetAll('medium_master'));
router.post('/mediums', authenticateToken, isAdmin, handleCreate('medium_master', 'medium_code', 'medium_name'));
router.put('/mediums/:id', authenticateToken, isAdmin, handleUpdate('medium_master', 'medium_code', 'medium_name'));
router.delete('/mediums/:id', authenticateToken, isAdmin, handleDelete('medium_master'));

// Payment Categories
router.get('/payment-categories', handleGetAll('payment_category_master'));
router.post('/payment-categories', authenticateToken, isAdmin, handleCreate('payment_category_master', 'category_code', 'category_name'));
router.put('/payment-categories/:id', authenticateToken, isAdmin, handleUpdate('payment_category_master', 'category_code', 'category_name'));
router.delete('/payment-categories/:id', authenticateToken, isAdmin, handleDelete('payment_category_master'));

// Payment Modes
router.get('/payment-modes', handleGetAll('payment_mode_master'));
router.post('/payment-modes', authenticateToken, isAdmin, handleCreate('payment_mode_master', 'mode_code', 'mode_name'));
router.put('/payment-modes/:id', authenticateToken, isAdmin, handleUpdate('payment_mode_master', 'mode_code', 'mode_name'));
router.delete('/payment-modes/:id', authenticateToken, isAdmin, handleDelete('payment_mode_master'));

// Convocation Issued
router.get('/convocation-issued', handleGetAll('convocation_issued_master'));
router.post('/convocation-issued', authenticateToken, isAdmin, handleCreate('convocation_issued_master', 'issued_code', 'issued_name'));
router.put('/convocation-issued/:id', authenticateToken, isAdmin, handleUpdate('convocation_issued_master', 'issued_code', 'issued_name'));
router.delete('/convocation-issued/:id', authenticateToken, isAdmin, handleDelete('convocation_issued_master'));

// GET /api/master/second-languages
router.get('/second-languages', handleGetAll('second_language_master'));

// GET /api/master/part-ii
router.get('/part-ii', handleGetAll('part_ii_master'));

// GET /api/master/part-iii
router.get('/part-iii', handleGetAll('part_iii_master'));

module.exports = router;
