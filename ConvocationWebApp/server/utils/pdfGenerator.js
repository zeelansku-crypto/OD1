const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateCertificate = (studentData, res) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Stream the PDF to the response
    doc.pipe(res);

    // Header
    doc.fontSize(20).text(studentData.university || 'UNIVERSITY NAME', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text('Convocation Certificate Application', { align: 'center' });
    doc.moveDown();

    // Student Details
    doc.fontSize(12).text(`Hall Ticket No: ${studentData.hall_ticket_no}`);
    doc.text(`Candidate Name: ${studentData.candidate_name}`);
    doc.text(`Father's Name: ${studentData.father_name}`);
    doc.text(`Course: ${studentData.course_group}`);
    doc.text(`Specialization: ${studentData.specialization}`);
    doc.text(`Class Awarded: ${studentData.part1_class || 'N/A'}`); // Example

    doc.moveDown();
    doc.text(`Status: Application Submitted`, { align: 'right' });

    // Seal Placeholder
    doc.moveDown(2);
    doc.rect(400, 600, 100, 100).stroke();
    doc.text('Seal', 435, 645);

    // Finalize
    doc.end();
};

module.exports = { generateCertificate };
