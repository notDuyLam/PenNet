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



module.exports = router;