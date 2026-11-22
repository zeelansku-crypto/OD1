const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const db = require('../utils/db');
const path = require('path');
const fs = require('fs');

const toProperCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const LABEL_COLOR = '#3A5F90'; 
const FACULTY_COLOR = '#800000'; 

// Helper to get student data
const getStudentData = async (hallTicketNo) => {
    const sql = `SELECT * FROM convocation_students WHERE hall_ticket_no = $1`;
    const result = await db.query(sql, [hallTicketNo]);
    return result.rows[0];
};

const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/convocation', authenticateToken, async (req, res) => {
    try {
        const { degree, faculty, hall_ticket_no } = req.body;
        console.log(`[PDF Req] HTNO: ${hall_ticket_no}, Degree: ${degree}, Faculty: ${faculty}`);

        if (!degree || !faculty || !hall_ticket_no) {
            console.error('[PDF Req] Missing fields');
            return res.status(400).json({ message: 'Missing mandatory fields: Degree, Faculty, Hall Ticket No' });
        }

        const student = await getStudentData(hall_ticket_no);
        console.log(`[PDF Req] DB Lookup for ${hall_ticket_no}:`, student ? 'Found' : 'Not Found');

        if (!student) {
            return res.status(404).json({ message: `No record found for Hall Ticket No: ${hall_ticket_no}` });
        }

        // Flexible validation for Degree and Faculty
        const dbDegree = (student.degree || '').toUpperCase();
        const inputDegree = (degree || '').toUpperCase();
        const dbFaculty = (student.faculty || '').toLowerCase();
        const inputFaculty = (faculty || '').toLowerCase();

        const degreeMatch = (dbDegree === inputDegree) ||
            (dbDegree === 'UG' && inputDegree === 'UG EDUCATION') ||
            (dbDegree === 'UG EDUCATION' && inputDegree === 'UG');

        const facultyMatch = dbFaculty.includes(inputFaculty) || inputFaculty.includes(dbFaculty);

        if (!degreeMatch || !facultyMatch) {
            console.warn(`Record found for ${hall_ticket_no} but Degree/Faculty mismatch:`, {
                input: { degree, faculty },
                stored: { degree: student.degree, faculty: student.faculty }
            });
            return res.status(404).json({
                message: `Record found for ${hall_ticket_no}, but Degree/Faculty does not match. Expected: ${student.degree} (${student.faculty})`
            });
        }

        // Generate QR Code Data
        const qrData = JSON.stringify({
            University: student.university,
            Degree: student.degree,
            Faculty: student.faculty,
            HallTicketNo: student.hall_ticket_no,
            Name: student.candidate_name,
            Course: student.course_group,
            Year: student.academic_year,
            Convocation: student.convocation_issued_in
        });

        const qrCodeImage = await QRCode.toDataURL(qrData);

        // Create PDF
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        // Stream to response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=Report_${hall_ticket_no}.pdf`);
        doc.pipe(res);

        // --- DETERMINE PDF FORMAT BASED ON DEGREE AND YEAR ---
        const degreeCodeCheck = (student.degree || '').toUpperCase();
        const yearStrCheck = student.academic_year || '';
        const yearMatchCheck = yearStrCheck.match(/(\d{4})/);
        const startYearCheck = yearMatchCheck ? parseInt(yearMatchCheck[0], 10) : 0;

        // NEW PG-SPECIFIC PDF FORMAT: For PG degrees with Academic Year 2000-2020
        if (degreeCodeCheck === 'PG' && startYearCheck >= 2000 && startYearCheck <= 2020) {
            // === NEW PG PDF FORMAT (Certificate Style) ===

            // Edwardian Font Path for stylized text
            const edwardianFontPath = 'C:\\Windows\\Fonts\\ITCEDSCR.TTF';
            const facultyFontPath = 'C:\\Windows\\Fonts\\PARCHM.TTF';

            // 1. Student Photo (Left)
            const photoY = 60;
            if (student.student_photo_blob) {
                doc.image(student.student_photo_blob, 50, photoY, { width: 80, height: 100 });
            } else if (student.student_photo) {
                const photoPath = path.resolve(__dirname, '../../uploads', student.student_photo);
                if (fs.existsSync(photoPath)) {
                    doc.image(photoPath, 50, photoY, { width: 80, height: 100 });
                } else {
                    doc.rect(50, photoY, 80, 100).stroke();
                    doc.fontSize(8).fillColor('black').text('Photo Not Found', 55, photoY + 40);
                }
            }

            // 2. QR Code (Right)
            doc.image(qrCodeImage, 460, photoY, { width: 80, height: 80 });

            // 3. Aadhar No. and Reg. No. (Same Line)
            const labelY = photoY + 110;
            doc.font('Helvetica-Bold').fontSize(9).fillColor(LABEL_COLOR).text(`Aadhar. No.  ${student.aadhaar_no || ''}`, 50, labelY);

            doc.font('Helvetica-Bold').fontSize(9).fillColor(LABEL_COLOR).text('Reg. No.', 380, labelY);
            doc.rect(430, labelY - 5, 120, 20).stroke();
            doc.font('Helvetica-Bold').fontSize(10).fillColor('black').text(student.hall_ticket_no || '', 435, labelY);

            // 4. Centered Faculty Title
            const facultyY = labelY + 25;
            if (fs.existsSync(facultyFontPath)) {
                doc.font(facultyFontPath).fontSize(32).fillColor(FACULTY_COLOR).text(student.faculty || '', 50, facultyY, { align: 'center', width: 500 });
            } else {
                doc.font('Times-Bold').fontSize(24).fillColor(FACULTY_COLOR).text(student.faculty || '', 50, facultyY, { align: 'center', width: 500 });
            }

            // 5. Certificate Text & Candidate Name (Underlined)
            doc.y = facultyY + 45;
            const certTextY = doc.y;
            const properCandidateName = toProperCase(student.candidate_name);

            doc.font('Helvetica-Bold').fontSize(11).fillColor(LABEL_COLOR).text('This is to certify that Mr./Ms.', 50, certTextY + 15);
            const nameX = 210;
            const nameWidth = 340;
            doc.moveTo(nameX, certTextY + 27).lineTo(nameX + nameWidth, certTextY + 27).stroke();

            if (fs.existsSync(edwardianFontPath)) {
                doc.font(edwardianFontPath).fontSize(28).fillColor('black').text(properCandidateName, nameX, certTextY - 0.5, { width: nameWidth, align: 'left' });
            } else {
                doc.font('Times-BoldItalic').fontSize(20).fillColor('black').text(properCandidateName, nameX, certTextY + 7.5, { width: nameWidth, align: 'left' });
            }

            // 6. Father's Name (Underlined)
            doc.moveDown(0.5);
            const fatherTextY = doc.y;
            const properFatherName = toProperCase(student.father_name);

            doc.font('Helvetica-Bold').fontSize(11).fillColor(LABEL_COLOR).text('Son / Daughter of', 50, fatherTextY + 7.5);
            const fatherX = 160;
            const fatherWidth = 390;
            doc.moveTo(fatherX, fatherTextY + 19.5).lineTo(fatherX + fatherWidth, fatherTextY + 19.5).stroke();

            if (fs.existsSync(edwardianFontPath)) {
                doc.font(edwardianFontPath).fontSize(24).fillColor('black').text(properFatherName, fatherX, fatherTextY - 6, { width: fatherWidth, align: 'left' });
            } else {
                doc.font('Times-BoldItalic').fontSize(18).fillColor('black').text(properFatherName, fatherX, fatherTextY, { width: fatherWidth, align: 'left' });
            }

            // 7. Degree Admitted Label
            doc.moveDown(1); // Moved up by 1 line space (2 -> 1)
            doc.font('Helvetica-Bold').fontSize(11).fillColor(LABEL_COLOR).text('has been duly admitted to the Degree of', 50, doc.y);

            // 8. Course Name (Parchment Font)
            doc.moveDown(1.5); // Moved up by 1 line space (2.5 -> 1.5)
            if (fs.existsSync(facultyFontPath)) {
                doc.font(facultyFontPath).fontSize(32).fillColor('black').text(student.course_group || '', { align: 'center' });
            } else {
                doc.font('Times-BoldItalic').fontSize(24).fillColor('black').text(student.course_group || '', { align: 'center' });
            }

            // 8b. Specialization (Arial style)
            const hasSpecialization = student.specialization && student.specialization.trim().toUpperCase() !== 'NOT REQUIRED';

            if (hasSpecialization) {
                doc.moveDown(0.4);
                doc.font('Helvetica').fontSize(13).fillColor('black').text(student.specialization || '', { align: 'center' });
                // 9. Examination declaration text
                doc.moveDown(2.2); // Compensated for shifts and specialization
            } else {
                // 9. Examination declaration text
                doc.moveDown(1.0); // Original Phase 2 spacing when specialization is hidden
            }

            doc.font('Helvetica-Bold').fontSize(11).fillColor(LABEL_COLOR).text(
                'of this University, he / she having been declared to have passed the examination',
                50, doc.y, { align: 'left' }
            );

            // 10. PART-I Result Formatting (Two Lines with Underlines)
            doc.moveDown(2.0); // Moved down by 1 line space (1.0 -> 2.0)
            const resultY = doc.y;

            // Line 1: prescribed therefor in ________ class,
            const line1Y = resultY;
            doc.font('Helvetica-Bold').fontSize(11).fillColor(LABEL_COLOR).text('prescribed therefor in', 50, line1Y);

            const classValX = 190;
            const classLineLength = 310;
            doc.moveTo(classValX, line1Y + 12).lineTo(classValX + classLineLength, line1Y + 12).stroke();

            if (fs.existsSync(edwardianFontPath)) {
                doc.font(edwardianFontPath).fontSize(24).fillColor('black').text(toProperCase(student.part1_class) || '', classValX, line1Y - 8, { width: classLineLength, align: 'center' });
            } else {
                doc.font('Times-Italic').fontSize(16).fillColor('black').text(toProperCase(student.part1_class) || '', classValX, line1Y, { width: classLineLength, align: 'center' });
            }

            doc.font('Helvetica-Bold').fontSize(11).fillColor(LABEL_COLOR).text('class,', classValX + classLineLength + 5, line1Y);

            // Line 2: held in the month of ________ in the year ________
            const line2Y = line1Y + 58; // Moved down by 1 line space (43 -> 58)
            doc.font('Helvetica-Bold').fontSize(11).fillColor(LABEL_COLOR).text('held in the month of', 50, line2Y);

            const monthValX = 170;
            const monthLineLength = 150;
            doc.moveTo(monthValX, line2Y + 12).lineTo(monthValX + monthLineLength, line2Y + 12).stroke();

            if (fs.existsSync(edwardianFontPath)) {
                doc.font(edwardianFontPath).fontSize(22).fillColor('black').text(toProperCase(student.part1_month) || '', monthValX, line2Y - 6, { width: monthLineLength, align: 'center' });
            } else {
                doc.font('Times-Italic').fontSize(14).fillColor('black').text(toProperCase(student.part1_month) || '', monthValX, line2Y, { width: monthLineLength, align: 'center' });
            }

            doc.font('Helvetica-Bold').fontSize(11).fillColor(LABEL_COLOR).text('in the year', monthValX + monthLineLength + 5, line2Y);

            const yearValX = 390;
            const yearLineLength = 160;
            doc.moveTo(yearValX, line2Y + 12).lineTo(yearValX + yearLineLength, line2Y + 12).stroke();

            if (fs.existsSync(edwardianFontPath)) {
                doc.font(edwardianFontPath).fontSize(22).fillColor('black').text(student.part1_year || '', yearValX, line2Y - 6, { width: yearLineLength, align: 'center' });
            } else {
                doc.font('Times-Italic').fontSize(14).fillColor('black').text(student.part1_year || '', yearValX, line2Y, { width: yearLineLength, align: 'center' });
            }

            // 12. Vice-Chancellor Signature Label (Bottom Right)
            const bottomY = 750;
            doc.font('Helvetica-Bold').fontSize(12).fillColor(FACULTY_COLOR).text('Vice-Chancellore', 420, bottomY);

            // End PDF for PG format
            doc.end();
            return; // Exit early - do not execute the UG/default logic below
        }

        // NEW UG (Education)-SPECIFIC PDF FORMAT: For UG Education with Academic Year 2000-2015
        const isEduFaculty = (student.faculty || '').toLowerCase().includes('education');
        const isEduDegree = (student.degree || '').toLowerCase().includes('education') || (student.degree || '').toLowerCase().includes('b.ed');
        const isUGEducation = (isEduFaculty || isEduDegree) && degreeCodeCheck !== 'PG';

        if (isUGEducation && startYearCheck >= 2000 && startYearCheck <= 2015) {
            // === NEW UG EDUCATION PDF FORMAT (OD_BED_OLD Style) ===

            // Font Paths
            const edwardianFontPath = 'C:\\Windows\\Fonts\\ITCEDSCR.TTF';
            const facultyFontPath = 'C:\\Windows\\Fonts\\PARCHM.TTF';
            const teluguFontPath = 'C:\\Windows\\Fonts\\Nirmala.ttf';

            // 1. Student Photo (Top Left)
            const photoY = 60;
            const photoX = 60;
            if (student.student_photo_blob) {
                doc.image(student.student_photo_blob, photoX, photoY, { width: 90, height: 110 });
            } else if (student.student_photo) {
                const photoPath = path.resolve(__dirname, '../../uploads', student.student_photo);
                if (fs.existsSync(photoPath)) {
                    doc.image(photoPath, photoX, photoY, { width: 90, height: 110 });
                } else {
                    doc.rect(photoX, photoY, 90, 110).stroke();
                    doc.fontSize(8).fillColor('black').text('Photo Not Found', photoX + 5, photoY + 40);
                }
            }

            // 2. Hall Ticket No (Top Right)
            doc.font('Helvetica-Bold').fontSize(11).fillColor('#778899').text(hall_ticket_no, 435, 170, { align: 'right', width: 100 });

            // 3. QR Code (Top Right)
            doc.image(qrCodeImage, 460, 60, { width: 80, height: 80 });

            // 4. Faculty of Education (Centered, Decorative)
            const facultyY = 125;
            if (fs.existsSync(facultyFontPath)) {
                doc.font(facultyFontPath).fontSize(38).fillColor(FACULTY_COLOR).text('Faculty of Education', 0, facultyY, { align: 'center', width: 595 });
            } else {
                doc.font('Times-Bold').fontSize(26).fillColor(FACULTY_COLOR).text('Faculty of Education', 0, facultyY, { align: 'center', width: 595 });
            }

            // 5. Aadhar No. (Below Photo)
            const aadharY = 195;
            const labelFont = 'Helvetica-Bold';
            doc.font(labelFont).fontSize(9).fillColor(LABEL_COLOR).text('Aadhar No.  ', photoX, aadharY, { continued: true });
            doc.fillColor(LABEL_COLOR).text(student.aadhaar_no || '');

            // 6. "This is to certify that" (Right side of Aadhar)
            doc.font(labelFont).fontSize(11).fillColor(LABEL_COLOR).text('This is to certify that', 285, aadharY);

            // 7. Mr./Ms and Candidate Name
            const nameY = 220;
            doc.font(labelFont).fontSize(11).fillColor(LABEL_COLOR).text('Mr./Ms  ', 60, nameY);

            const properCandidateName = toProperCase(student.candidate_name);
            if (fs.existsSync(edwardianFontPath)) {
                doc.font(edwardianFontPath).fontSize(32).fillColor('black').text(properCandidateName, 130, nameY - 18, { width: 400 });
            } else {
                doc.font('Times-BoldItalic').fontSize(22).fillColor('black').text(properCandidateName, 130, nameY - 5, { width: 400 });
            }

            // 8. Son/Daughter of and Father's Name
            const fatherY = 250;
            doc.font(labelFont).fontSize(11).fillColor(LABEL_COLOR).text('Son/Daughter of  ', 60, fatherY);

            const properFatherName = toProperCase(student.father_name);
            if (fs.existsSync(edwardianFontPath)) {
                doc.font(edwardianFontPath).fontSize(26).fillColor('black').text(properFatherName, 200, fatherY - 14, { width: 400 });
            } else {
                doc.font('Times-BoldItalic').fontSize(18).fillColor('black').text(properFatherName, 200, fatherY - 2, { width: 400 });
            }

            // 9. Admission to Degree
            const degreeY = 280;
            doc.font(labelFont).fontSize(11).fillColor(LABEL_COLOR).text('has been duly admitted to the Degree of  ', 60, degreeY, { continued: true });
            doc.font('Helvetica-Bold').fontSize(16).fillColor('black').text('Bachelor of Education');

            // 10. Medium (Top right of table section)
            const mediumY = 320;
            const medLabel = 'Medium :  ';
            const medVal = (student.medium || 'English').toUpperCase();
            doc.font(labelFont).fontSize(11).fillColor(LABEL_COLOR).text(medLabel, 430, mediumY, { continued: true });
            doc.font('Helvetica-Bold').fontSize(12).fillColor('black').text(medVal);

            // 11. Instruction Text (Declaration)
            const instructionY = 345;
            doc.font('Times-Bold').fontSize(11).fillColor('#2F4F4F').text(
                'of this University he / she having been declared to have passed the examination prescribed therefor as follows :',
                50, instructionY, { align: 'left', width: 500 }
            );

            // 12. Subjects Table
            const tableTop = 370;
            const col1X = 48;
            const col1W = 260;
            const col2X = col1X + col1W;
            const col2W = 160;
            const col3X = col2X + col2W;
            const col3W = 100;

            // Header Row
            doc.font(labelFont).fontSize(11).fillColor('black');
            doc.rect(col1X, tableTop, col1W, 25).stroke();
            doc.rect(col2X, tableTop, col2W, 25).stroke();
            doc.rect(col3X, tableTop, col3W, 25).stroke();

            doc.text('School Subjects', col1X + 10, tableTop + 7);
            doc.text('Month and Year of Passing', col2X + 5, tableTop + 7, { align: 'center', width: col2W - 10 });
            doc.text('Class Awarded', col3X + 5, tableTop + 7, { align: 'center', width: col3W - 10 });

            // Row 1 (School Subjects)
            let currentRowY = tableTop + 25;
            const row1Height = 120;

            doc.rect(col1X, currentRowY, col1W, row1Height).stroke();
            doc.rect(col2X, currentRowY, col2W, row1Height).stroke();
            doc.rect(col3X, currentRowY, col3W, row1Height).stroke();

            if (student.part_ii) {
                const subjects = student.part_ii.split(',');
                if (fs.existsSync(edwardianFontPath)) {
                    doc.font(edwardianFontPath).fontSize(30).fillColor('black');
                } else {
                    doc.font('Times-Italic').fontSize(22).fillColor('black');
                }
                subjects.forEach((subj, index) => {
                    doc.text(subj.trim(), col1X + 20, currentRowY + 20 + (index * 30));
                });
            }

            // Row 1 Month/Year
            if (fs.existsSync(edwardianFontPath)) {
                doc.font(edwardianFontPath).fontSize(26).fillColor('black');
            } else {
                doc.font('Times-Italic').fontSize(18).fillColor('black');
            }
            const row1MY = `${toProperCase(student.part1_month) || ''} ${toProperCase(student.part1_year) || ''}`.trim();
            doc.text(row1MY, col2X + 5, currentRowY + 45, { align: 'center', width: col2W - 10 });

            // Row 1 Class
            const row1Class = toProperCase(student.part1_class) || '';
            doc.text(row1Class, col3X + 5, currentRowY + 45, { align: 'center', width: col3W - 10 });

            // Row 2 (PRACTICALS & RECORDS)
            currentRowY += row1Height;
            const row2Height = 90;
            doc.rect(col1X, currentRowY, col1W, row2Height).stroke();
            doc.rect(col2X, currentRowY, col2W, row2Height).stroke();
            doc.rect(col3X, currentRowY, col3W, row2Height).stroke();

            doc.font(labelFont).fontSize(11).fillColor('black').text('PRACTICALS & RECORDS', col1X + 20, currentRowY + 40);

            // Row 2 Month/Year
            if (fs.existsSync(edwardianFontPath)) {
                doc.font(edwardianFontPath).fontSize(26).fillColor('black');
            } else {
                doc.font('Times-Italic').fontSize(18).fillColor('black');
            }
            const row2MY = `${toProperCase(student.part2_month) || ''} ${toProperCase(student.part2_year) || ''}`.trim();
            doc.text(row2MY, col2X + 5, currentRowY + 40, { align: 'center', width: col2W - 10 });

            // Row 2 Class
            const row2Class = toProperCase(student.part2_class) || '';
            doc.text(row2Class, col3X + 5, currentRowY + 40, { align: 'center', width: col3W - 10 });

            // 13. Footer (Registrar)
            const footerY = 700;
            doc.font(labelFont).fontSize(13).fillColor('black').text('Registrar', 460, footerY);

            if (fs.existsSync(teluguFontPath)) {
                doc.registerFont('Telugu', teluguFontPath);
                doc.font('Telugu').fontSize(11).text('రిజిస్ట్రార్', 465, footerY + 18);
            } else {
                doc.fontSize(11).text('రిజిస్ట్రార్', 465, footerY + 18);
            }

            // End PDF for UG Education format
            doc.end();
            return;
        }

        // NEW EDUCATION-SPECIFIC PDF FORMAT: For UG Education with Academic Year 2018-2020 (OD_BED_NEW Style)
        if (isUGEducation && startYearCheck >= 2016 && startYearCheck <= 2020) {
            // === NEW EDUCATION 2016-2020 PDF FORMAT (OD_BED_NEW Style) ===

            // Font Paths
            const edwardianFontPath = 'C:\\Windows\\Fonts\\ITCEDSCR.TTF';
            const facultyFontPath = 'C:\\Windows\\Fonts\\PARCHM.TTF';
            const teluguFontPath = 'C:\\Windows\\Fonts\\Nirmala.ttf';

            // 1. Student Photo (Top Left)
            const photoY = 60;
            const photoX = 60;
            if (student.student_photo_blob) {
                doc.image(student.student_photo_blob, photoX, photoY, { width: 90, height: 110 });
            } else if (student.student_photo) {
                const photoPath = path.resolve(__dirname, '../../uploads', student.student_photo);
                if (fs.existsSync(photoPath)) {
                    doc.image(photoPath, photoX, photoY, { width: 90, height: 110 });
                } else {
                    doc.rect(photoX, photoY, 90, 110).stroke();
                    doc.fontSize(8).fillColor('black').text('Photo Not Found', photoX + 5, photoY + 40);
                }
            }

            // 2. Hall Ticket No (Top Right)
            doc.font('Helvetica-Bold').fontSize(11).fillColor('#4682B4').text(hall_ticket_no, 460, 80, { align: 'right', width: 100 });

            // 3. QR Code (Top Right)
            doc.image(qrCodeImage, 470, 110, { width: 85, height: 85 });

            // 4. Faculty of Education (Centered, Decorative)
            const facultyY = 125;
            if (fs.existsSync(facultyFontPath)) {
                doc.font(facultyFontPath).fontSize(38).fillColor(FACULTY_COLOR).text('Faculty of Education', 0, facultyY, { align: 'center', width: 595 });
            } else {
                doc.font('Times-Bold').fontSize(26).fillColor(FACULTY_COLOR).text('Faculty of Education', 0, facultyY, { align: 'center', width: 595 });
            }

            // 5. Aadhar No. (Below Photo)
            const aadharY = 195;
            const labelFont = 'Helvetica-Bold';
            doc.font(labelFont).fontSize(9).fillColor('#4682B4').text('Aadhar No.  ', photoX, aadharY, { continued: true });
            doc.fillColor('#4682B4').text(student.aadhaar_no || '');

            // 6. "This is to certify that" (Right side of Aadhar)
            doc.font(labelFont).fontSize(11).fillColor('#4682B4').text('This is to certify that', 285, aadharY);

            // 7. Mr./Ms and Candidate Name
            const nameY = 220;
            doc.font(labelFont).fontSize(11).fillColor('#4682B4').text('Mr./Ms  ', 60, nameY);

            const properCandidateName = toProperCase(student.candidate_name);
            if (fs.existsSync(edwardianFontPath)) {
                doc.font(edwardianFontPath).fontSize(32).fillColor('black').text(properCandidateName, 130, nameY - 18, { width: 400 });
            } else {
                doc.font('Times-BoldItalic').fontSize(22).fillColor('black').text(properCandidateName, 130, nameY - 5, { width: 400 });
            }

            // 8. Son/Daughter of and Father's Name
            const fatherY = 250;
            doc.font(labelFont).fontSize(11).fillColor('#4682B4').text('Son/Daughter of  ', 60, fatherY);

            const properFatherName = toProperCase(student.father_name);
            if (fs.existsSync(edwardianFontPath)) {
                doc.font(edwardianFontPath).fontSize(26).fillColor('black').text(properFatherName, 200, fatherY - 14, { width: 400 });
            } else {
                doc.font('Times-BoldItalic').fontSize(18).fillColor('black').text(properFatherName, 200, fatherY - 2, { width: 400 });
            }

            // 9. Admission to Degree
            const degreeY = 280;
            doc.font(labelFont).fontSize(11).fillColor('#4682B4').text('has been duly admitted to the Degree of  ', 60, degreeY, { continued: true });
            doc.font('Times-Bold').fontSize(16).fillColor('black').text('Bachelor of Education');

            // 10. Medium (Top right of table section)
            const mediumY = 320;
            const medLabel = 'Medium :  ';
            const medVal = (student.medium || 'English').toUpperCase();
            doc.font(labelFont).fontSize(11).fillColor('#4682B4').text(medLabel, 430, mediumY, { continued: true });
            doc.font('Helvetica-Bold').fontSize(12).fillColor('black').text(medVal);

            // 11. Instruction Text (Declaration)
            const instructionY = 345;
            doc.font('Times-Bold').fontSize(11).fillColor('#4682B4').text(
                'of this University he / she having been declared to have passed the examination prescribed therefor as follows :',
                50, instructionY, { align: 'left', width: 500 }
            );

            // 12. Subjects Table (4 Columns for OD_BED_NEW)
            const tableTop = 370;
            const col1X = 48;
            const col1W = 180; // School Subjects
            const col2X = col1X + col1W;
            const col2W = 140; // Month and Year
            const col3X = col2X + col2W;
            const col3W = 90;  // Class Awarded
            const col4X = col3X + col3W;
            const col4W = 90;  // Grade Obtained

            // Header Row
            doc.font(labelFont).fontSize(10).fillColor('#4682B4');
            doc.rect(col1X, tableTop, col1W, 25).stroke();
            doc.rect(col2X, tableTop, col2W, 25).stroke();
            doc.rect(col3X, tableTop, col3W, 25).stroke();
            doc.rect(col4X, tableTop, col4W, 25).stroke();

            doc.text('School Subjects', col1X + 5, tableTop + 7, { align: 'center', width: col1W - 10 });
            doc.text('Month and Year of Passing', col2X + 5, tableTop + 7, { align: 'center', width: col2W - 10 });
            doc.text('Class Awarded', col3X + 5, tableTop + 7, { align: 'center', width: col3W - 10 });
            doc.text('Grade Obtained', col4X + 5, tableTop + 7, { align: 'center', width: col4W - 10 });

            // Row 1
            let currentRowY = tableTop + 25;
            const row1Height = 230;

            doc.rect(col1X, currentRowY, col1W, row1Height).stroke();
            doc.rect(col2X, currentRowY, col2W, row1Height).stroke();
            doc.rect(col3X, currentRowY, col3W, row1Height).stroke();
            doc.rect(col4X, currentRowY, col4W, row1Height).stroke();

            // Row 1 Content (mapped from part1)
            if (student.part_ii) {
                const subjects = student.part_ii.split(',');
                if (fs.existsSync(edwardianFontPath)) {
                    doc.font(edwardianFontPath).fontSize(30).fillColor('black');
                } else {
                    doc.font('Times-Italic').fontSize(22).fillColor('black');
                }
                subjects.forEach((subj, index) => {
                    doc.text(subj.trim(), col1X + 15, currentRowY + 40 + (index * 30));
                });
            }

            // Month/Year Row 1
            if (fs.existsSync(edwardianFontPath)) {
                doc.font(edwardianFontPath).fontSize(26).fillColor('black');
            } else {
                doc.font('Times-Italic').fontSize(18).fillColor('black');
            }
            const row1MY = `${toProperCase(student.part1_month) || ''} ${toProperCase(student.part1_year) || ''}`.trim();
            doc.text(row1MY, col2X + 5, currentRowY + 60, { align: 'center', width: col2W - 10 });

            // Class Row 1
            const row1Class = toProperCase(student.part1_class) || '';
            doc.text(row1Class, col3X + 5, currentRowY + 60, { align: 'center', width: col3W - 10 });

            // Grade Row 1
            const row1Grade = (student.part1_grade || '').toUpperCase();
            doc.text(row1Grade, col4X + 5, currentRowY + 60, { align: 'center', width: col4W - 10 });

            // 13. Footer (Registrar)
            const footerY = 750;
            doc.font(labelFont).fontSize(13).fillColor('black').text('Registrar', 460, footerY);

            if (fs.existsSync(teluguFontPath)) {
                doc.registerFont('Telugu', teluguFontPath);
                doc.font('Telugu').fontSize(11).text('రిజిస్ట్రార్', 465, footerY + 18);
            } else {
                doc.fontSize(11).text('రిజిస్ట్రార్', 465, footerY + 18);
            }

            // End PDF for Education New format
            doc.end();
            return;
        }

        // === EXISTING PDF FORMAT (For UG and other cases) ===
        // --- PDF LAYOUT ---
        // Based on "Government-style layout" and generic requirements + screenshot implication

        // 1. Header (Hall Ticket No) - Top Right
        doc.font('Helvetica-Bold').fontSize(12).fillColor(LABEL_COLOR).text(hall_ticket_no, 450, 30, { align: 'right' });

        doc.moveDown(1);

        // Student Photo (Left)
        const photoY = 100;
        if (student.student_photo_blob) {
            doc.image(student.student_photo_blob, 50, photoY, { width: 80, height: 100 });
        } else if (student.student_photo) {
            const photoPath = path.resolve(__dirname, '../../uploads', student.student_photo);
            if (fs.existsSync(photoPath)) {
                doc.image(photoPath, 50, photoY, { width: 80, height: 100 });
            } else {
                doc.rect(50, photoY, 80, 100).stroke();
                doc.fontSize(8).fillColor('black').text('Photo Not Found', 55, photoY + 40);
            }
        }

        // Add Aadhar below photo
        doc.fontSize(8).fillColor(LABEL_COLOR).text('Aadhar No. ', 50, photoY + 110, { continued: true });
        doc.fillColor(LABEL_COLOR).font('Helvetica-Bold').text(student.aadhaar_no || 'N/A');

        // QR Code (Right)
        doc.image(qrCodeImage, 460, photoY, { width: 80, height: 80 });

        // Centered Faculty Title
        doc.y = 230; // Absolute position to ensure consistency
        const facultyFontPath = 'C:\\Windows\\Fonts\\PARCHM.TTF';
        if (fs.existsSync(facultyFontPath)) {
            doc.font(facultyFontPath).fontSize(36).fillColor(FACULTY_COLOR).text(student.faculty, { align: 'center' });
        } else {
            doc.font('Times-Bold').fontSize(24).fillColor(FACULTY_COLOR).text(student.faculty, { align: 'center' });
        }

        doc.moveDown(0.2);
        doc.font('Times-Bold').fontSize(11).fillColor(LABEL_COLOR).text('This is to certify that', { align: 'center' });

        doc.moveDown(1.2);

        // Edwardian Font Path
        const edwardianFontPath = 'C:\\Windows\\Fonts\\ITCEDSCR.TTF';

        // Candidate Name
        const currentY = doc.y;
        doc.font('Helvetica-Bold').fontSize(11).fillColor(LABEL_COLOR).text('Mr./Ms  ', 90, currentY);

        const properCandidateName = toProperCase(student.candidate_name);
        doc.y = currentY - 20; // Adjust position (Net UP by 1 space)
        if (fs.existsSync(edwardianFontPath)) {
            doc.font(edwardianFontPath).fontSize(32).fillColor('black').text(properCandidateName, 140, doc.y);
        } else {
            doc.font('Times-BoldItalic').fontSize(22).fillColor('black').text(properCandidateName, 140, doc.y + 5);
        }

        doc.y = currentY + 25; // Reset Y for next line

        // Father's Name
        const fatherY = doc.y;
        doc.font('Helvetica-Bold').fontSize(11).fillColor(LABEL_COLOR).text('Son/Daughter of  ', 90, fatherY + 12);

        const properFatherName = toProperCase(student.father_name);
        doc.y = fatherY - 5; // Adjust position
        if (fs.existsSync(edwardianFontPath)) {
            doc.font(edwardianFontPath).fontSize(28).fillColor('black').text(properFatherName, 190, doc.y);
        } else {
            doc.font('Times-BoldItalic').fontSize(20).fillColor('black').text(properFatherName, 190, doc.y + 5);
        }

        doc.y = fatherY + 25;

        doc.moveDown(0.3);

        // Degree Admitted
        doc.font('Helvetica-Bold').fontSize(11).fillColor(LABEL_COLOR).text('has been duly admitted to the Degree of  ', 90, doc.y, { continued: true });
        // Apply Arial (Helvetica) Bold, Size 18 for the value
        doc.font('Helvetica-Bold').fontSize(16).fillColor('black').text(student.course_group);

        // Specialization (UG)
        const hasSpecialization = student.specialization && student.specialization.trim().toUpperCase() !== 'NOT REQUIRED';
        if (hasSpecialization) {
            doc.moveDown(0.1);
            doc.font('Helvetica').fontSize(13).fillColor('black').text(student.specialization || '', 90, doc.y);
            doc.moveDown(0.3);
        } else {
            // Medium
            doc.moveDown(0.5);
        }
        const medLabel = 'Medium: ';
        const medVal = student.medium.toUpperCase();

        // Calculate widths
        doc.font('Helvetica-Bold').fontSize(11);
        const labelWidth = doc.widthOfString(medLabel);
        doc.fontSize(12);
        const valWidth = doc.widthOfString(medVal);

        // Position from right margin (50 margin + 2 safety)
        const rightMarginX = doc.page.width - 52;
        const startX = rightMarginX - (labelWidth + valWidth);
        const mediumY = doc.y;

        // Print Label and Value manually to ensure no wrapping/overlap issues
        doc.font('Helvetica-Bold').fontSize(11).fillColor(LABEL_COLOR).text(medLabel, startX, mediumY);
        doc.font('Helvetica-Bold').fontSize(12).fillColor('black').text(medVal, startX + labelWidth, mediumY);

        // Instruction Text
        // Ensure we move down significantly from the Medium line
        const instructionY = mediumY + 20;
        doc.y = instructionY;

        doc.font('Helvetica-Bold').fontSize(10).fillColor(LABEL_COLOR).text(
            'of this University he / she having been declared to have passed the examination prescribed therefor as follows :',
            50,
            instructionY,
            { align: 'left', width: 500 } // Explicit width to ensure single line
        );

        // Table
        const tableTop = doc.y + 10;
        const col1X = 50;
        const col2X = 300;
        const col3X = 450;
        const tableWidth = 500;

        doc.font('Times-Bold');

        // Headers
        // doc.rect(col1X, tableTop, tableWidth, 20).stroke(); // This entire rect is redundant if we draw cols below
        // doc.text('Subjects', col1X + 5, tableTop + 5); // REMOVED REDUNDANT LINE

        // Header Row
        doc.rect(col1X, tableTop, 250, 20).stroke(); // Col 1
        doc.rect(col2X, tableTop, 150, 20).stroke(); // Col 2
        doc.rect(col3X, tableTop, 100, 20).stroke(); // Col 3

        doc.text('Subjects', col1X + 10, tableTop + 5, { width: 230 });
        doc.text('Month and Year of Passing', col2X + 10, tableTop + 5, { width: 130, align: 'center' });
        doc.text('Class Awarded', col3X + 10, tableTop + 5, { width: 80, align: 'center' });

        // Content Row 1 (Part I)
        let currentRowY = tableTop + 20; // Start below header
        const row1Height = 100; // ample space for subjects

        // Always draw the row structure to preserve layout
        doc.font('Times-Roman').fontSize(10);
        doc.rect(col1X, currentRowY, 250, row1Height).stroke();
        doc.rect(col2X, currentRowY, 150, row1Height).stroke();
        doc.rect(col3X, currentRowY, 100, row1Height).stroke();

        // Logic Check:
        // Show Part-I details if NOT PG (i.e. UG), OR if PG and year in 2000-2020.
        const degreeCode = (student.degree || '').toUpperCase();
        const yearStrPart1 = student.academic_year || '';
        const yearMatchPart1 = yearStrPart1.match(/(\d{4})/);
        const startYear = yearMatchPart1 ? parseInt(yearMatchPart1[0], 10) : 0;

        let showPart1Content = true;
        let showPart1Subjects = true; // Default to showing subjects (e.g. English)

        // Strict Condition: If PG, only show if within range 2000-2020.
        // AND for this range, do NOT show hardcoded subjects (English/Second Lang).
        if (degreeCode === 'PG') {
            if (startYear >= 2000 && startYear <= 2020) {
                showPart1Content = true;
                showPart1Subjects = false; // Requirement: "includes only... PART1 values stored in database"
            } else {
                showPart1Content = false;
            }
        }

        if (showPart1Content) {
            // Part I Content
            doc.font('Times-Bold').text('PART - I :', col1X + 10, currentRowY + 10);

            if (showPart1Subjects) {
                doc.font('Times-Roman');
                doc.text('(a) ENGLISH', col1X + 10, currentRowY + 30);
                doc.text(`(b) ${student.second_language || 'Second Language'}`, col1X + 10, currentRowY + 45);
            }

            // Month/Year
            doc.font('Helvetica-Bold').fontSize(11).fillColor('black').text(`${student.part1_month || ''} ${student.part1_year || ''}`, col2X + 10, currentRowY + 40, { align: 'left' });

            // Class
            if (fs.existsSync(edwardianFontPath)) {
                doc.font(edwardianFontPath).fontSize(24).text(student.part1_class || '', col3X + 10, currentRowY + 40, { align: 'center' });
            } else {
                doc.font('Times-Italic').fontSize(18).text(student.part1_class || '', col3X + 10, currentRowY + 40, { align: 'center' });
            }
        }

        // Always increment Y since we always drew the row
        currentRowY += row1Height;


        // Content Row 2 (Part II)
        const row2Height = 80;

        doc.font('Times-Roman').fontSize(10);
        doc.rect(col1X, currentRowY, 250, row2Height).stroke();
        doc.rect(col2X, currentRowY, 150, row2Height).stroke();
        doc.rect(col3X, currentRowY, 100, row2Height).stroke();

        doc.font('Times-Bold').text('PART - II :', col1X + 10, currentRowY + 10);
        doc.font('Times-Roman');
        // Parse subjects from student.part_ii
        // Split by comma and display each on a new line
        if (student.part_ii) {
            const subjects = student.part_ii.split(',');
            subjects.forEach((subj, index) => {
                // Ensure no comma is displayed, just the text
                doc.text(subj.trim(), col1X + 10, currentRowY + 25 + (index * 12));
            });
        }

        // Month/Year
        doc.font('Helvetica-Bold').fontSize(11).fillColor('black').text(`${student.part2_month || ''} ${student.part2_year || ''}`, col2X + 10, currentRowY + 30, { align: 'left' });

        // Class
        if (fs.existsSync(edwardianFontPath)) {
            doc.font(edwardianFontPath).fontSize(24).text(student.part2_class || '', col3X + 10, currentRowY + 30, { align: 'center' });
        } else {
            doc.font('Times-Italic').fontSize(18).text(student.part2_class || '', col3X + 10, currentRowY + 30, { align: 'center' });
        }

        // --- PART-III Conditional Logic ---
        // Requirement: Display PART-III only if Academic_Year contains "2013" or "2014"
        const yearStr = (student.academic_year || '');
        const showPart3 = yearStr.includes('2013') || yearStr.includes('2014');

        console.log(`Checking PART-III for HTNO: ${student.hall_ticket_no}, AY: "${student.academic_year}", ShowPart3: ${showPart3}`);

        if (showPart3) {
            currentRowY += row2Height;
            const row3Height = 80;

            doc.font('Times-Roman').fontSize(10);
            doc.rect(col1X, currentRowY, 250, row3Height).stroke();
            doc.rect(col2X, currentRowY, 150, row3Height).stroke();
            doc.rect(col3X, currentRowY, 100, row3Height).stroke();

            doc.font('Times-Bold').text('PART - III :', col1X + 10, currentRowY + 10);
            doc.font('Times-Roman');

            if (student.part_iii) {
                const subjects = student.part_iii.split(',');
                subjects.forEach((subj, index) => {
                    doc.text(subj.trim(), col1X + 10, currentRowY + 25 + (index * 12));
                });
            }

            // Month/Year - Explicitly using the fields requested by user
            const part3MonthYear = `${student.part3_month || ''} ${student.part3_year || ''}`.trim();
            doc.font('Helvetica-Bold').fontSize(11).fillColor('black').text(part3MonthYear, col2X + 10, currentRowY + 30, { align: 'left' });

            // Class - Explicitly using the part3_class field
            if (fs.existsSync(edwardianFontPath)) {
                doc.font(edwardianFontPath).fontSize(24).text(student.part3_class || '', col3X + 10, currentRowY + 30, { align: 'center' });
            } else {
                doc.font('Times-Italic').fontSize(18).text(student.part3_class || '', col3X + 10, currentRowY + 30, { align: 'center' });
            }
        }

        // Registrar Signature
        doc.moveDown(10);
        const bottomY = 750;
        doc.font('Helvetica-Bold').fontSize(14).fillColor('black').text('Registrar', 460, bottomY);

        // Register and use Nirmala font for Telugu
        const teluguFontPath = 'C:\\Windows\\Fonts\\Nirmala.ttf';
        if (fs.existsSync(teluguFontPath)) {
            doc.registerFont('Telugu', teluguFontPath);
            doc.font('Telugu').fontSize(10).text('రిజిస్ట్రార్', 465, bottomY + 16);
        } else {
            doc.fontSize(10).text('రిజిస్ట్రార్', 465, bottomY + 16);
        }

        doc.end();

    } catch (error) {
        console.error('Report Generation Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

module.exports = router;
