const express = require('express');

// cài đặt router
const router = express.Router();

// Home route
router.get('/', (req, res) => {
    res.render('home', {});
});

// Login route
router.get('/login', (req, res) => {
    res.render('login', {});
});

// Signup route
router.get('/signup', (req, res) => {
    res.render('signup', {});
});

// friendRequest route
router.get('/friends', (req, res) => {
    res.render('friendRequest', {});
});

module.exports = router;