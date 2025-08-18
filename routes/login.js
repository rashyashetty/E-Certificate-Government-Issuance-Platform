const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'login.html'));
});

router.post('/login', (req, res) => {
  // Login logic goes here
  res.redirect('/register');  // After login, redirect to register page
});

router.post('/signup', (req, res) => {
  // Signup logic goes here
  res.redirect('/register');  // After signup, redirect to register page
});

module.exports = router;
