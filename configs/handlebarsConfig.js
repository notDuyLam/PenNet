const { create } = require("express-handlebars");

const hbs = create({
  extname: ".hbs",
  encoding: "utf-8",
  layoutsDir: "./views/layouts",
  partialsDir: "./views/partials",
  defaultLayout: "main",
  runtimeOptions: {
    allowProtoPropertiesByDefault: true, // Cho phép truy cập vào các thuộc tính prototype
    allowProtoMethodsByDefault: true, // Cho phép truy cập vào các phương thức prototype
  },
});

module.exports = hbs;
