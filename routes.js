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
router.get('/friendRequest', (req, res) => {
    res.render('friendRequest', {});
});

// friend route
router.get('/friendList', (req, res) => {
    res.render('friendList', {});
});
module.exports = router;