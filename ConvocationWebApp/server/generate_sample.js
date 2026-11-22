const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const toProperCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const LABEL_COLOR = '#3A5F90';
const FACULTY_COLOR = '#800000';

const generateSample = async () => {
    try {
        console.log('Generating sample PDF...');

        const student = {
            university: 'SKU',
            degree: 'Bachelor of Arts',
            faculty: 'Faculty of Arts',
            hall_ticket_no: 'B1216629009',
            candidate_name: 'Nallaboyina Swapna',
            father_name: 'Nallaboyina Komuraiah',
            course_group: 'B.A.',
            academic_year: '2023-2024',
            convocation_issued_in: 'In Person',
            medium: 'Telugu',
            aadhaar_no: '976092145279',
            second_language: 'Telugu',
            part1_month: 'July',
            part1_year: '2014',
            part1_class: 'Second',
            part_iii: 'Indian Heritage and Culture, Science and Civilization',
            part_ii: 'HISTORY, POLITICAL SCIENCE, ADV. TELUGU',
            part2_month: 'November',
            part2_year: '2015',
            part2_class: 'First',
            student_photo_blob: fs.readFileSync(path.join(__dirname, 'test_photo.png'))
        };

        const qrData = JSON.stringify({
            HT: student.hall_ticket_no,
            Name: student.candidate_name,
            Degree: student.degree
        });
        const qrCodeImage = await QRCode.toDataURL(qrData);

        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const outputPath = path.resolve(__dirname, 'sample_report_v7.pdf');
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // 1. Header (Hall Ticket No) - Top Right
        doc.font('Helvetica-Bold').fontSize(12).fillColor(LABEL_COLOR).text(student.hall_ticket_no, 450, 30, { align: 'right' });

        // Student Photo (Left)
        const photoY = 100;
        if (student.student_photo_blob) {
            doc.image(student.student_photo_blob, 50, photoY, { width: 80, height: 100 });
        }

        // Add Aadhar below photo
        doc.fontSize(8).fillColor(LABEL_COLOR).text('Aadhar No. ', 50, photoY + 110, { continued: true });
        doc.fillColor(LABEL_COLOR).font('Helvetica-Bold').text(student.aadhaar_no || 'N/A');

        // QR Code (Right)
        doc.image(qrCodeImage, 460, photoY, { width: 80, height: 80 });

        // Centered Faculty Title
        doc.y = 230;
        const facultyFontPath = 'C:\\Windows\\Fonts\\PARCHM.TTF';
        if (fs.existsSync(facultyFontPath)) {
            doc.font(facultyFontPath).fontSize(36).fillColor(FACULTY_COLOR).text(student.faculty, { align: 'center' });
        } else {
            doc.font('Times-Bold').fontSize(24).fillColor(FACULTY_COLOR).text(student.faculty, { align: 'center' });
        }

        doc.moveDown(0.2);
        doc.font('Times-Bold').fontSize(11).fillColor(LABEL_COLOR).text('This is to certify that', { align: 'center' });

        doc.moveDown(1.2);

        const edwardianFontPath = 'C:\\Windows\\Fonts\\ITCEDSCR.TTF';

        // Candidate Name
        const currentY = doc.y;
        doc.font('Helvetica-Bold').fontSize(11).fillColor(LABEL_COLOR).text('Mr./Ms  ', 90, currentY);

        const properCandidateName = toProperCase(student.candidate_name);
        doc.y = currentY - 20; // Move name UP by 1 space instead of 2
        if (fs.existsSync(edwardianFontPath)) {
            doc.font(edwardianFontPath).fontSize(32).fillColor('black').text(properCandidateName, 140, doc.y);
        } else {
            doc.font('Times-BoldItalic').fontSize(22).fillColor('black').text(properCandidateName, 140, doc.y + 5);
        }

        doc.y = currentY + 25; // Reset for next field

        // Father's Name
        const fatherY = doc.y;
        doc.font('Helvetica-Bold').fontSize(11).fillColor(LABEL_COLOR).text('Son/Daughter of  ', 90, fatherY + 12);

        const properFatherName = toProperCase(student.father_name);
        doc.y = fatherY - 5; // Move name UP less
        if (fs.existsSync(edwardianFontPath)) {
            doc.font(edwardianFontPath).fontSize(28).fillColor('black').text(properFatherName, 190, doc.y);
        } else {
            doc.font('Times-BoldItalic').fontSize(20).fillColor('black').text(properFatherName, 190, doc.y + 5);
        }

        doc.y = fatherY + 25;

        doc.moveDown(0.3);

        // Degree Admitted
        doc.font('Helvetica-Bold').fontSize(11).fillColor(LABEL_COLOR).text('has been duly admitted to the Degree of  ', 90, doc.y, { continued: true });
        doc.font('Helvetica-Bold').fontSize(14).fillColor('black').text(student.degree);

        // Medium
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(11).fillColor(LABEL_COLOR).text('Medium : ', { continued: true, align: 'right' });
        doc.font('Helvetica-Bold').fontSize(12).fillColor('black').text(student.medium.toUpperCase());

        // Instruction Text
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(10).fillColor(LABEL_COLOR).text('of this University he / she having been declared to have passed the examination prescribed therefor as follows :', { align: 'left' });

        // Table
        const tableTop = doc.y + 10;
        const col1X = 50;
        const col2X = 300;
        const col3X = 450;
        const tableWidth = 500;

        doc.font('Helvetica-Bold');

        // Headers
        doc.rect(col1X, tableTop, tableWidth, 20).stroke();
        doc.rect(col1X, tableTop, 250, 20).stroke();
        doc.rect(col2X, tableTop, 150, 20).stroke();
        doc.rect(col3X, tableTop, 100, 20).stroke();

        doc.fontSize(10).text('Subjects', col1X + 10, tableTop + 5, { width: 230 });
        doc.text('Month and Year of Passing', col2X + 10, tableTop + 5, { width: 130, align: 'center' });
        doc.text('Class Awarded', col3X + 10, tableTop + 5, { width: 80, align: 'center' });

        // Row 1 (Part I)
        let currentRowY = tableTop + 20;
        const row1Height = 120;
        doc.rect(col1X, currentRowY, 250, row1Height).stroke();
        doc.rect(col2X, currentRowY, 150, row1Height).stroke();
        doc.rect(col3X, currentRowY, 100, row1Height).stroke();

        doc.font('Helvetica-Bold').fontSize(10).text('PART - I :', col1X + 10, currentRowY + 10);
        doc.font('Helvetica-Bold').text('(a) ENGLISH', col1X + 10, currentRowY + 30);
        doc.text(`(b)${student.medium}`, col1X + 10, currentRowY + 45);
        doc.font('Helvetica-Bold').fontSize(9).text(student.part_iii, col1X + 10, currentRowY + 60, { width: 230 });

        doc.font('Helvetica-Bold').fontSize(11).text(`${student.part1_month} ${student.part1_year}`, col2X + 10, currentRowY + 40, { align: 'center' });

        if (fs.existsSync(edwardianFontPath)) {
            doc.font(edwardianFontPath).fontSize(24).text(student.part1_class, col3X + 10, currentRowY + 40, { align: 'center' });
        } else {
            doc.font('Times-Italic').fontSize(18).text(student.part1_class, col3X + 10, currentRowY + 40, { align: 'center' });
        }

        // Row 2 (Part II)
        currentRowY += row1Height;
        const row2Height = 80;
        doc.rect(col1X, currentRowY, 250, row2Height).stroke();
        doc.rect(col2X, currentRowY, 150, row2Height).stroke();
        doc.rect(col3X, currentRowY, 100, row2Height).stroke();

        doc.font('Helvetica-Bold').fontSize(10).text('PART - II :', col1X + 10, currentRowY + 10);
        const subjects = student.part_ii.split(',');
        subjects.forEach((subj, index) => {
            doc.font('Helvetica-Bold').text(subj.trim(), col1X + 10, currentRowY + 25 + (index * 12));
        });

        doc.font('Helvetica-Bold').fontSize(11).text(`${student.part2_month}  ${student.part2_year}`, col2X + 10, currentRowY + 30, { align: 'center' });

        if (fs.existsSync(edwardianFontPath)) {
            doc.font(edwardianFontPath).fontSize(24).text(student.part2_class, col3X + 10, currentRowY + 30, { align: 'center' });
        } else {
            doc.font('Times-Italic').fontSize(18).text(student.part2_class, col3X + 10, currentRowY + 30, { align: 'center' });
        }

        // Registrar
        doc.moveDown(10);
        const bottomY = 750;
        doc.font('Helvetica-Bold').fontSize(14).fillColor('black').text('Registrar', 460, bottomY);

        const teluguFontPath = 'C:\\Windows\\Fonts\\Nirmala.ttf';
        if (fs.existsSync(teluguFontPath)) {
            doc.registerFont('Telugu', teluguFontPath);
            doc.font('Telugu').fontSize(10).text('రిజిస్ట్రార్', 465, bottomY + 16);
        } else {
            doc.fontSize(10).text('రిజిస్ట్రార్', 465, bottomY + 16);
        }

        doc.end();
        console.log('PDF Generated at:', outputPath);

    } catch (e) {
        console.error(e);
    }
};

generateSample();
