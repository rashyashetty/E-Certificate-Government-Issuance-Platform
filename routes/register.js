const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'register.html'));
});

router.post('/', (req, res) => {
  const { username, email, password } = req.body;
  // Registration logic goes here (save user to DB, etc.)
  res.redirect('/selection');  // After successful registration, redirect to selection page
});

module.exports = router;
