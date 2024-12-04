const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

// config hbs
const hbs = require('./config/handlebarsConfig');
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', './views');


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});