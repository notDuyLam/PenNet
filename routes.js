const express = require('express');

// cài đặt router
const router = express.Router();

// Home route
router.get('/', (req, res) => {
    res.render('home', {});
});

router.get('/user/id=:id', (req, res) => {
    res.render('personProfile', {});
});

// Login route
router.get('/login', (req, res) => {
    res.render('login', {});
});

// Signup route
router.get('/signup', (req, res) => {
    res.render('signup', {});
});

module.exports = router;