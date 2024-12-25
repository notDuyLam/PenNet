const {create} = require('express-handlebars');
const helpers = require('../helpers/handlebars.helpers');


const hbs = create({
    extname: '.hbs',
    encoding: 'utf-8',
    layoutsDir: './views/layouts',
    partialsDir: './views/partials',
    defaultLayout: 'main',
    helpers: helpers
});

module.exports = hbs;