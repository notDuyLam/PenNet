const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");

const app = express();
const port = 3000;

// Để sử dụng biến môi trường trong file .env
require("dotenv").config();

// Sử dụng json parser
app.use(express.json());
// Sử dụng x-www-form-urlencoded parser
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// Express session
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.SESSION_STORE_URI,
      ttl: 14 * 24 * 60 * 60,
      autoRemove: "native",
    }),
    secret: "penNetSecret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

// Passport middlewares
app.use(passport.session());
app.use(passport.initialize());

// config static files
app.use(express.static(path.join(__dirname, "public")));

// config hbs
const hbs = require("./config/handlebarsConfig");
const routes = require("./routes");
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "./views");

app.use("/", routes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
