const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// GET route to serve the death certificate form (HTML page)
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'death-certificate.html'));  // Use path to resolve the file path
});

// POST route to handle form submission for the death certificate
router.post('/', upload.fields([
  { name: 'file_upload' },
  { name: 'aadhaar_card' },
  { name: 'birthcertificate_proof' },
  { name: 'medicalcertificate_proof' },
]), (req, res) => {
  const { deceasedName, dateOfDeath, otp } = req.body;
  
  // OTP validation logic (Example: Check if OTP matches)
  if (otp !== '123456') {  // You can change this to a dynamic OTP system
    return res.status(400).json({ message: 'Invalid OTP!' });
  }

  // Log the form data for testing
  console.log(deceasedName, dateOfDeath);  // You can add more fields based on your needs
  console.log(req.files);  // Log uploaded files
  
  // Save the form data to the database or perform further processing
  // For example, you can save to MongoDB
  const deathDetails = new DeathCertificate({
    deceasedName,
    dateOfDeath,
    otp,
    files: req.files,  // Save uploaded files
  });

  deathDetails.save()
    .then(() => {
      res.json({ message: 'Death Certificate Submitted Successfully!' });
    })
    .catch(err => {
      res.status(500).json({ message: 'Error submitting the death certificate!' });
    });
});

module.exports = router;
