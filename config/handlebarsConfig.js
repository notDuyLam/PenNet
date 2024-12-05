const {create} = require('express-handlebars');

const hbs = create({
    extname: '.hbs',
    encoding: 'utf-8',
    layoutsDir: './views/layouts',
    partialsDir: './views/partials',
    defaultLayout: 'main'
});

module.exports = hbs;