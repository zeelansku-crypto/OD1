const express = require('express');
const db = require('../utils/db');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadToSupabase, getStoragePublicUrl } = require('../utils/supabaseStorage');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const uploadDir = path.resolve(__dirname, '../uploads');
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (e) {
    // Read-only filesystem in serverless environments (Netlify / AWS Lambda)
}

// File upload configuration for multiple fields
const cpUpload = upload.fields([
    { name: 'student_photo', maxCount: 1 },
    { name: 'dd_challan_certificate', maxCount: 1 }
]);

// POST /api/convocation - Create new application
router.post('/', authenticateToken, cpUpload, async (req, res) => {
    try {
        console.log('Received Convocation Submission:', req.body);
        const data = req.body;

        let student_photo_filename = null;
        let student_photo_blob = null;
        if (req.files && req.files['student_photo'] && req.files['student_photo'][0]) {
            const photoFile = req.files['student_photo'][0];
            student_photo_blob = photoFile.buffer;

            const safeHtNo = (data.hall_ticket_no || 'STUDENT').toString().trim().replace(/[^a-zA-Z0-9_-]/g, '_');
            const storagePath = `student-photos/${safeHtNo}_${Date.now()}.jpeg`;
            try {
                const uploadRes = await uploadToSupabase(student_photo_blob, storagePath, 'image/jpeg');
                student_photo_filename = uploadRes?.path || storagePath;
            } catch (uploadErr) {
                console.error("Student photo upload failed:", uploadErr);
                return res.status(500).json({ message: 'Student photo upload failed: ' + (uploadErr.message || uploadErr), error: uploadErr.message });
            }
        }

        let dd_challan_filename = null;
        let dd_challan_blob = null;
        if (req.files && req.files['dd_challan_certificate'] && req.files['dd_challan_certificate'][0]) {
            const certFile = req.files['dd_challan_certificate'][0];
            dd_challan_blob = certFile.buffer;

            const safeHtNo = (data.hall_ticket_no || 'STUDENT').toString().trim().replace(/[^a-zA-Z0-9_-]/g, '_');
            const storagePath = `certificates/${safeHtNo}_${Date.now()}.pdf`;
            try {
                const uploadRes = await uploadToSupabase(dd_challan_blob, storagePath, 'application/pdf');
                dd_challan_filename = uploadRes?.path || storagePath;
            } catch (uploadErr) {
                console.error("Certificate upload failed:", uploadErr);
                return res.status(500).json({ message: 'Certificate upload failed: ' + (uploadErr.message || uploadErr), error: uploadErr.message });
            }
        }

        const sql = `INSERT INTO convocation_students (
            university, hall_ticket_no, candidate_name, father_name, dob, gender, category, 
            aadhaar_no, mode_of_study, degree, faculty, course_group, subject, specialization, 
            research_title, research_date, 
            part1_class, part1_month, part1_year, part1_grade,
            part2_class, part2_month, part2_year, part2_grade,
            part3_class, part3_month, part3_year, part3_grade,
            medium, student_photo, student_photo_blob,
            payment_category, payment_mode, dd_challan_no, dd_challan_date, dd_challan_certificate, 
            dd_challan_certificate_blob,
            issued_date, bank_name, ifsc_code, convocation_fee, convocation_issued_in, 
            second_language, elective_subjects, academic_year, remarks, 
            manual_serial_no, branch_name, part_ii, part_iii, submitted_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51) RETURNING id`;

        const params = [
            data.university || null, data.hall_ticket_no || null, data.candidate_name || null, data.father_name || null, data.dob || null, data.gender || null, data.category || null,
            data.aadhaar_no || null, data.mode_of_study || null, data.degree || null, data.faculty || null, data.course_group || null, data.subject || null, data.specialization || null,
            data.research_title || null, data.research_date || null,
            data.part1_class || null, data.part1_month || null, data.part1_year || null, data.part1_grade || null,
            data.part2_class || null, data.part2_month || null, data.part2_year || null, data.part2_grade || null,
            data.part3_class || null, data.part3_month || null, data.part3_year || null, data.part3_grade || null,
            data.medium || null, student_photo_filename, student_photo_blob,
            data.payment_category || null, data.payment_mode || null, data.dd_challan_no || null, data.dd_challan_date || null, dd_challan_filename,
            dd_challan_blob,
            data.issued_date || null, data.bank_name || null, data.ifsc_code || null, data.convocation_fee || null, data.convocation_issued_in || null,
            data.second_language || null, data.elective_subjects || null, data.academic_year || null, data.remarks || null, data.manual_serial_no || null,
            data.branch_name || null, data.part_ii || null, data.part_iii || null, req.user.id
        ];

        try {
            const result = await db.query(sql, params);
            console.log('Record saved successfully, ID:', result.rows[0].id);
            res.status(201).json({ message: 'Application data saved successfully' });
        } catch (err) {
            console.error('DB Insert Error:', err);
            if (err.code === '23505') {
                return res.status(400).json({ message: 'Hall Ticket Number already exists.' });
            }
            return res.status(500).json({ message: 'Unable to save application data. Please try again.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// GET /api/convocation/stats - Dashboard Stats
// ... (omitted same content for brevity in replace_file_content)
// Note: I'll use multi_replace if I need to change scattered parts, 
// but here I'll just replace the relevant blocks.

// Wait, I should use multi_replace_file_content to be safe with line numbers.

// GET /api/convocation/stats - Dashboard Stats
router.get('/stats', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    console.log(`[Stats] Fetching enhanced stats for userId: ${userId}, role: ${userRole}`);

    try {
        const stats = {};

        // 1. Total Applications
        const totalRows = await db.query(`SELECT COUNT(*) as count FROM convocation_students`);
        stats.totalApplications = parseInt(totalRows.rows[0]?.count || 0);

        // 2. Mode of Study-wise count
        const modeWiseRows = await db.query(
            `SELECT mode_of_study, COUNT(*) as count FROM convocation_students GROUP BY mode_of_study`
        );
        stats.modeWise = modeWiseRows.rows.map(r => ({ ...r, count: parseInt(r.count) }));

        // 3. Degree-wise count within each Mode of Study
        const modeDegreeWiseRows = await db.query(
            `SELECT mode_of_study, degree, COUNT(*) as count FROM convocation_students GROUP BY mode_of_study, degree`
        );
        stats.modeDegreeWise = modeDegreeWiseRows.rows.map(r => ({ ...r, count: parseInt(r.count) }));

        // 4. Course-wise count
        const courseWiseRows = await db.query(
            `SELECT course_group, COUNT(*) as count FROM convocation_students GROUP BY course_group ORDER BY count DESC LIMIT 10`
        );
        stats.courseWise = courseWiseRows.rows.map(r => ({ ...r, count: parseInt(r.count) }));

        // 5. Faculty-wise count
        const facultyWiseRows = await db.query(
            `SELECT faculty, COUNT(*) as count FROM convocation_students GROUP BY faculty`
        );
        stats.facultyWise = facultyWiseRows.rows.map(r => ({ ...r, count: parseInt(r.count) }));

        console.log('[Stats] Enhanced stats generated successfully');
        res.json(stats);
    } catch (err) {
        console.error('[Stats] Database error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// GET /api/convocation/export/csv - Export CSV
router.get('/export/csv', authenticateToken, async (req, res) => {
    try {
        const sql = `SELECT 
            hall_ticket_no, candidate_name, father_name, dob, gender, category, 
            aadhaar_no, mode_of_study, degree, faculty, course_group, subject, specialization,
            university, research_title, research_date, medium, payment_category, payment_mode, 
            dd_challan_no, dd_challan_date, bank_name, branch_name, ifsc_code, convocation_fee, 
            convocation_issued_in, academic_year, manual_serial_no, remarks,
            student_photo, dd_challan_certificate
        FROM convocation_students`;
        
        const result = await db.query(sql);
        if (result.rows.length === 0) return res.status(404).send('No data found');

        const fields = Object.keys(result.rows[0]);
        const csvRows = [fields.join(',')];
        
        for (const row of result.rows) {
            const values = fields.map(field => {
                const val = row[field] !== null && row[field] !== undefined ? String(row[field]).replace(/"/g, '""') : '';
                return `"${val}"`;
            });
            csvRows.push(values.join(','));
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="convocation_data_export.csv"');
        res.send(csvRows.join('\n'));
    } catch (err) {
        console.error('CSV Export Error:', err);
        res.status(500).send('Error exporting CSV data');
    }
});

// GET /api/convocation/:hallTicketNo - Get Application details
router.get('/:hallTicketNo', authenticateToken, async (req, res) => {
    const sql = `SELECT * FROM convocation_students WHERE hall_ticket_no = $1`;
    try {
        const result = await db.query(sql, [req.params.hallTicketNo]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Record not found' });
        const row = result.rows[0];

        // Format all DATE fields cleanly to YYYY-MM-DD strings so frontend date inputs populate reliably
        const dateFields = ['dob', 'research_date', 'dd_challan_date', 'issued_date'];
        dateFields.forEach(df => {
            if (row[df]) {
                if (row[df] instanceof Date) {
                    const y = row[df].getFullYear();
                    const m = String(row[df].getMonth() + 1).padStart(2, '0');
                    const d = String(row[df].getDate()).padStart(2, '0');
                    row[df] = `${y}-${m}-${d}`;
                } else if (typeof row[df] === 'string' && row[df].includes('T')) {
                    row[df] = row[df].split('T')[0];
                }
            }
        });

        if (row.student_photo_blob) {
            row.has_student_photo_blob = true;
            delete row.student_photo_blob;
        }
        if (row.dd_challan_certificate_blob) {
            row.has_dd_challan_certificate_blob = true;
            delete row.dd_challan_certificate_blob;
        }

        res.json(row);
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// PUT /api/convocation/:hallTicketNo - Update Application details
router.put('/:hallTicketNo', authenticateToken, cpUpload, async (req, res) => {
    const hallTicketNo = req.params.hallTicketNo;
    const data = req.body;

    let updates = [];
    let params = [];
    let paramIndex = 1;

    // Fields that must be NULL (not empty string) when blank — PostgreSQL rejects '' for DATE/NUMERIC
    const dateFields = new Set(['dob', 'research_date', 'dd_challan_date', 'issued_date']);
    const numericFields = new Set(['convocation_fee']);

    // Helper: convert empty strings to null for date/numeric fields
    const sanitizeValue = (field, value) => {
        if (value === '' || value === null || value === undefined) {
            if (dateFields.has(field) || numericFields.has(field)) {
                return null;
            }
        }
        return value === undefined ? null : value;
    };

    const allowedFields = [
        'university', 'candidate_name', 'father_name', 'dob', 'gender', 'category',
        'aadhaar_no', 'mode_of_study', 'degree', 'faculty', 'course_group', 'subject', 'specialization',
        'research_title', 'research_date',
        'part1_class', 'part1_month', 'part1_year', 'part1_grade',
        'part2_class', 'part2_month', 'part2_year', 'part2_grade',
        'part3_class', 'part3_month', 'part3_year', 'part3_grade',
        'medium',
        'payment_category', 'payment_mode', 'dd_challan_no', 'dd_challan_date',
        'issued_date', 'bank_name', 'ifsc_code', 'convocation_fee', 'convocation_issued_in',
        'second_language', 'elective_subjects', 'academic_year', 'remarks',
        'manual_serial_no', 'branch_name', 'part_ii', 'part_iii'
    ];

    allowedFields.forEach(field => {
        if (data[field] !== undefined) {
            updates.push(`${field} = $${paramIndex++}`);
            params.push(sanitizeValue(field, data[field]));
        }
    });

    if (req.files && req.files['student_photo'] && req.files['student_photo'][0] && req.files['student_photo'][0].size > 0 && req.files['student_photo'][0].originalname) {
        const photoFile = req.files['student_photo'][0];
        const safeHtNo = (hallTicketNo || 'STUDENT').toString().trim().replace(/[^a-zA-Z0-9_-]/g, '_');
        const storagePath = `student-photos/${safeHtNo}_${Date.now()}.jpeg`;
        let photoVal = storagePath;
        try {
            const uploadRes = await uploadToSupabase(photoFile.buffer, storagePath, 'image/jpeg');
            photoVal = uploadRes?.path || storagePath;
        } catch (uploadErr) {
            console.error("Student photo upload failed:", uploadErr);
            return res.status(500).json({ message: 'Student photo upload failed: ' + (uploadErr.message || uploadErr), error: uploadErr.message });
        }

        updates.push(`student_photo = $${paramIndex++}`);
        params.push(photoVal);

        updates.push(`student_photo_blob = $${paramIndex++}`);
        params.push(photoFile.buffer);
    }
    if (req.files && req.files['dd_challan_certificate'] && req.files['dd_challan_certificate'][0] && req.files['dd_challan_certificate'][0].size > 0 && req.files['dd_challan_certificate'][0].originalname) {
        const certFile = req.files['dd_challan_certificate'][0];
        const safeHtNo = (hallTicketNo || 'STUDENT').toString().trim().replace(/[^a-zA-Z0-9_-]/g, '_');
        const storagePath = `certificates/${safeHtNo}_${Date.now()}.pdf`;
        let certVal = storagePath;
        try {
            const uploadRes = await uploadToSupabase(certFile.buffer, storagePath, 'application/pdf');
            certVal = uploadRes?.path || storagePath;
        } catch (uploadErr) {
            console.error("Certificate upload failed:", uploadErr);
            return res.status(500).json({ message: 'Certificate upload failed: ' + (uploadErr.message || uploadErr), error: uploadErr.message });
        }

        updates.push(`dd_challan_certificate = $${paramIndex++}`);
        params.push(certVal);

        updates.push(`dd_challan_certificate_blob = $${paramIndex++}`);
        params.push(certFile.buffer);
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const sql = `UPDATE convocation_students SET ${updates.join(', ')} WHERE hall_ticket_no = $${paramIndex}`;
    params.push(hallTicketNo);

    try {
        const result = await db.query(sql, params);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Record not found' });
        console.log(`[Update] Hall Ticket ${hallTicketNo} updated successfully.`);
        res.json({ message: 'Application Updated Successfully' });
    } catch (err) {
        console.error(`[Update Error] Hall Ticket ${hallTicketNo}:`, err.message);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});


// POST /api/convocation/download/pdf - Generate PDF
router.post('/download/pdf', authenticateToken, async (req, res) => {
    const { hall_ticket_no } = req.body;

    if (!hall_ticket_no) {
        return res.status(400).json({ message: 'Hall Ticket Number is required for download' });
    }

    const sql = `SELECT * FROM convocation_students WHERE hall_ticket_no = $1`;
    try {
        const result = await db.query(sql, [hall_ticket_no]);
        const row = result.rows[0];
        if (!row) return res.status(404).json({ message: 'Record not found' });

        const { generateCertificate } = require('../utils/pdfGenerator');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=convocation_${hall_ticket_no}.pdf`);
        generateCertificate(row, res);
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// GET /api/convocation/photo/:hallTicketNo - Serve student photo from DB or Supabase Storage
router.get('/photo/:hallTicketNo', async (req, res) => {
    const sql = `SELECT student_photo_blob, student_photo FROM convocation_students WHERE hall_ticket_no = $1`;
    try {
        const result = await db.query(sql, [req.params.hallTicketNo]);
        const row = result.rows[0];
        if (!row) return res.status(404).send('Photo not found');
        
        if (row.student_photo) {
            if (row.student_photo.startsWith('http://') || row.student_photo.startsWith('https://')) {
                return res.redirect(row.student_photo);
            }
            if (row.student_photo.startsWith('student-photos/') || row.student_photo.startsWith('photos/')) {
                const publicUrl = getStoragePublicUrl(row.student_photo);
                if (publicUrl) return res.redirect(publicUrl);
            }
        }

        if (row.student_photo_blob) {
            const filename = (row.student_photo || 'photo.jpg').toLowerCase();
            let contentType = 'image/jpeg';
            if (filename.endsWith('.png')) contentType = 'image/png';
            else if (filename.endsWith('.gif')) contentType = 'image/gif';
            else if (filename.endsWith('.webp')) contentType = 'image/webp';
            
            res.setHeader('Content-Type', contentType);
            return res.send(row.student_photo_blob);
        } else if (row.student_photo) {
            const filePath = path.resolve(__dirname, '../../uploads', row.student_photo);
            const altPath = path.resolve(__dirname, '../uploads', row.student_photo);
            const targetPath = fs.existsSync(filePath) ? filePath : (fs.existsSync(altPath) ? altPath : null);
            if (targetPath) {
                return res.sendFile(targetPath);
            }
        }
        return res.status(404).send('Photo not found');
    } catch (err) {
        console.error('Error fetching photo:', err);
        res.status(500).send('Error fetching photo');
    }
});

// GET /api/convocation/certificate/:hallTicketNo - Serve certificate from DB or Supabase Storage
router.get('/certificate/:hallTicketNo', async (req, res) => {
    const sql = `SELECT dd_challan_certificate_blob, dd_challan_certificate FROM convocation_students WHERE hall_ticket_no = $1`;
    try {
        const result = await db.query(sql, [req.params.hallTicketNo]);
        const row = result.rows[0];
        if (!row) return res.status(404).send('Certificate not found');
        
        if (row.dd_challan_certificate) {
            if (row.dd_challan_certificate.startsWith('http://') || row.dd_challan_certificate.startsWith('https://')) {
                return res.redirect(row.dd_challan_certificate);
            }
            if (row.dd_challan_certificate.startsWith('certificates/')) {
                const publicUrl = getStoragePublicUrl(row.dd_challan_certificate);
                if (publicUrl) return res.redirect(publicUrl);
            }
        }

        if (row.dd_challan_certificate_blob) {
            const filename = (row.dd_challan_certificate || 'certificate.pdf').toLowerCase();
            let contentType = 'application/pdf';
            if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) contentType = 'image/jpeg';
            else if (filename.endsWith('.png')) contentType = 'image/png';

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `inline; filename="${row.dd_challan_certificate || 'certificate.pdf'}"`);
            return res.send(row.dd_challan_certificate_blob);
        } else if (row.dd_challan_certificate) {
            const filePath = path.resolve(__dirname, '../../uploads', row.dd_challan_certificate);
            const altPath = path.resolve(__dirname, '../uploads', row.dd_challan_certificate);
            const targetPath = fs.existsSync(filePath) ? filePath : (fs.existsSync(altPath) ? altPath : null);
            if (targetPath) {
                return res.sendFile(targetPath);
            }
        }
        return res.status(404).send('Certificate not found');
    } catch (err) {
        console.error('Error fetching certificate:', err);
        res.status(500).send('Error fetching certificate');
    }
});

module.exports = router;
