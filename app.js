const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// config static files
app.use(express.static(path.join(__dirname, 'public')));

// config hbs
const hbs = require('./config/handlebarsConfig');
const routes = require('./routes');
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', './views');

app.use('/', routes);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});