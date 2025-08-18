const express = require('express');
const path = require('path');  // Add this line
const router = express.Router();

// GET route to serve the death certificate form (HTML page)
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'death-certificate.html'));  // Use path to resolve the file path
});

// POST route to handle form submission for the death certificate
router.post('/', (req, res) => {
  const { deceasedName, dateOfDeath } = req.body;  // Assume these fields in the form
  console.log(deceasedName, dateOfDeath);  // Log the form data for testing
  res.send('Death Certificate Submitted!');
});

module.exports = router;
