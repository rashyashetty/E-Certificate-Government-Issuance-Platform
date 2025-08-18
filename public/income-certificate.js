const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Serve the HTML form
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'income-certificate.html'));
});

// Handle form submission
router.post(
    '/',
    upload.fields([
        { name: 'identityProof' },
        { name: 'addressProof' },
        { name: 'incomeProof' },
    ]),
    async (req, res) => {
        try {
            console.log('Form Data:', req.body);
            console.log('Uploaded Files:', req.files);

            const { fullName, dob, gender, occupation, annualIncome, incomeSource, purpose, phoneNumber, otp } = req.body;

            // Validate OTP
            if (otp !== req.body.generatedOTP) {
                return res.status(400).json({ message: 'Invalid OTP!' });
            }

            // Mock database save (replace with actual DB code)
            const incomeDetails = {
                fullName,
                dob,
                gender,
                occupation,
                annualIncome,
                incomeSource,
                purpose,
                phoneNumber,
                documents: req.files,
            };
            console.log('Saved Data:', incomeDetails);

            res.json({ message: 'Income Certificate Submitted Successfully!' });
        } catch (err) {
            console.error('Error submitting income certificate:', err.message);
            res.status(500).json({ message: 'Server Error', error: err.message });
        }
    }
);

module.exports = router;
