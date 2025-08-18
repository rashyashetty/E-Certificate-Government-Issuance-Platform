const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'selection.html'));  // Page with options to select certificate type
});

module.exports = router;
