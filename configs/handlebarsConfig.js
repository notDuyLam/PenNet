const { create } = require("express-handlebars");
const helpers = require("../helpers/handlebars.helpers");

const hbs = create({
  extname: ".hbs",
  encoding: "utf-8",
  layoutsDir: "./views/layouts",
  partialsDir: "./views/partials",
  defaultLayout: "main",
  helpers: helpers,
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
    includes: function (array, value) {
      if (!Array.isArray(array)) return false;
      for (let item of array) {
        if (item.user_id === value) {
          return true;
        }
      }
      return false;
    },
    eq: function (a, b) {
      return a === b;
    },
    timeAgo: function (date) {
      if (!date) return "";
      const now = new Date();
      const secondsPast = (now.getTime() - new Date(date).getTime()) / 1000;

      if (secondsPast < 60) {
        return `${Math.floor(secondsPast)} seconds ago`;
      }
      if (secondsPast < 3600) {
        return `${Math.floor(secondsPast / 60)} minutes ago`;
      }
      if (secondsPast <= 86400) {
        return `${Math.floor(secondsPast / 3600)} hours ago`;
      }
      if (secondsPast > 86400) {
        const day = new Date(date).getDate();
        const month = new Date(date).toLocaleString("default", {
          month: "short",
        });
        const year =
          new Date(date).getFullYear() === now.getFullYear()
            ? ""
            : new Date(date).getFullYear();
        return `${day} ${month} ${year}`;
      }
    },
    or: function (a, b) {
      return a || b;
    },
  },
});

module.exports = hbs;
