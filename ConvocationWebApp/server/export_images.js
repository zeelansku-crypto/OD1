const fs = require('fs');
const path = require('path');
const db = require('./utils/db');

async function exportImages() {
    console.log('Starting image extraction script...');
    
    // Create folders if they don't exist
    const outputDir = path.join(__dirname, 'exported_images');
    const photosDir = path.join(outputDir, 'student_photos');
    const certificatesDir = path.join(outputDir, 'dd_challan_certificates');
    
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir);
    if (!fs.existsSync(certificatesDir)) fs.mkdirSync(certificatesDir);

    try {
        const result = await db.query(`SELECT hall_ticket_no, student_photo, student_photo_blob, dd_challan_certificate, dd_challan_certificate_blob FROM convocation_students`);
        const rows = result.rows;
        
        console.log(`Found ${rows.length} total student records in the database.`);
        let count = 0;

        for (const row of rows) {
            const htNo = row.hall_ticket_no || `UNKNOWN_${Date.now()}`;
            
            // Save Photo
            if (row.student_photo_blob) {
                const ext = row.student_photo ? path.extname(row.student_photo) : '.jpg';
                const filename = `${htNo}_photo${ext}`;
                fs.writeFileSync(path.join(photosDir, filename), row.student_photo_blob);
            }
            
            // Save Certificate
            if (row.dd_challan_certificate_blob) {
                const ext = row.dd_challan_certificate ? path.extname(row.dd_challan_certificate) : '.pdf';
                const filename = `${htNo}_certificate${ext}`;
                fs.writeFileSync(path.join(certificatesDir, filename), row.dd_challan_certificate_blob);
            }
            
            count++;
            if (count % 10 === 0) console.log(`Processed ${count} students...`);
        }
        
        console.log('');
        console.log('✅ EXTRACTION COMPLETE!');
        console.log(`Successfully saved physical files into: ${outputDir}`);
        process.exit(0);

    } catch (err) {
        console.error('Error extracting images:', err);
        process.exit(1);
    }
}

exportImages();
