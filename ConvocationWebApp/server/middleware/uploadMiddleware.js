const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists (safe for serverless / read-only environments)
const uploadDir = path.resolve(__dirname, '../uploads');
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (e) {
    // Read-only filesystem in serverless environments (Netlify / AWS Lambda)
}

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // If no file was selected or filename is empty, allow it through (route will ignore empty buffers)
    if (!file.originalname || file.originalname.trim() === '') {
        return cb(null, true);
    }
    // Exact file types from requirements: PDF/Image only
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/octet-stream';

    if (mimetype || extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images and PDFs are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
    fileFilter: fileFilter
});

module.exports = upload;
