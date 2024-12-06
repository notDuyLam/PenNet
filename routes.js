const express = require('express');

// cài đặt router
const router = express.Router();

// Home route
router.get('/', (req, res) => {
    res.render('home', {
        // title: 'Home Page',
        // name: 'John Doe'
    });
});

// Login route
router.get('/login', (req, res) => {
    res.render('login', {
        // title: 'Home Page',
        // name: 'John Doe'
    });
});

// Signup route
router.get('/signup', (req, res) => {
    res.render('signup', {
        // title: 'Home Page',
        // name: 'John Doe'
    });
});

module.exports = router;