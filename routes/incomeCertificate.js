const express = require('express');
const multer = require('multer');
const path = require('path');
const IncomeCertificate = require('../models/IncomeCertificate');
const router = express.Router();

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// GET: Serve Income Certificate Form
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/income-certificate.html'));
});

// POST: Handle Form Submission
router.post(
  '/submit-income-certificate',
  upload.fields([
    { name: 'identityProof' },
    { name: 'addressProof' },
    { name: 'incomeProof' },
    { name: 'bankStatement' },
    { name: 'employmentProof' },
    { name: 'affidavit' },
  ]),
  async (req, res) => {
    try {
      const {
        fullName, dob, gender, relationName, maritalStatus,
        permanentAddress, currentAddress, occupation,
        annualIncome, incomeSource, purpose, phoneNumber, generatedOTP, otp,
      } = req.body;

      if (generatedOTP !== otp) {
        return res.status(400).json({ message: 'Invalid OTP!' });
      }

      const incomeCertificate = new IncomeCertificate({
        fullName, dob, gender, relationName, maritalStatus,
        permanentAddress, currentAddress, occupation,
        annualIncome, incomeSource, purpose, phoneNumber, otp,
        documents: {
          identityProof: req.files.identityProof[0].filename,
          addressProof: req.files.addressProof[0].filename,
          incomeProof: req.files.incomeProof[0].filename,
          bankStatement: req.files.bankStatement[0].filename,
          employmentProof: req.files.employmentProof[0].filename,
          affidavit: req.files.affidavit[0].filename,
        },
      });

      await incomeCertificate.save();
      res.json({ message: 'Income Certificate submitted successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error processing the request.' });
    }
  }
);

module.exports = router;
