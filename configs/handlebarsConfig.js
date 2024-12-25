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
  helpers: {
    formatDate: function (date) {
      if (!date) return "";
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString("en-US", options);
    },
    gridClass: function (length) {
      return length > 1 ? "grid grid-cols-2 gap-4" : "grid grid-cols-1 gap-4";
    },
  },
});

module.exports = hbs;
