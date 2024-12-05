const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// config static files
app.use(express.static(path.join(__dirname, 'public')));

// config hbs
const hbs = require('./config/handlebarsConfig');
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', './views');


app.get('/', (req, res) => {
    res.render('home', {
        // title: 'Home Page',
        // name: 'John Doe'
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});