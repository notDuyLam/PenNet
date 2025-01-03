const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const mongoose = require("mongoose");
const db = require("./configs/db");

const app = express();

const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;

// Để sử dụng biến môi trường trong file .env
require("dotenv").config();

// Passport config
require("./configs/passport")(passport);

// Sử dụng json parser
app.use(express.json());

// Sử dụng x-www-form-urlencoded parser
app.use(express.urlencoded({ extended: true }));

// Sử dụng cors
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
const hbs = require("./configs/handlebarsConfig");
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "./views");

// Định nghĩa các routes
app.use("/users", require("./apps/user/routes"));
app.use("/posts", require("./apps/post/routes"));

app.use("/", require("./apps/routes"));
app.use("/conversations", require("./apps/conversation/routes"));

// APIs
app.use("/api/users", require("./apps/user/api"));
app.use("/api/conversations", require("./apps/conversation/api"));

// Kết nối database
const {
  User,
  UserInfo,
  UserRela,
  Post,
  Like,
  Comment,
  Attachment,
  Conversation,
  Participant,
  Message,
} = require("./apps/apps.associations"); // connect models

const connectDB = async () => {
  console.log("Check database connection...");

  try {
    await db.authenticate();
    // Đồng bộ các models
    await db.sync({ force: false });
    console.log("Database connection established");
  } catch (e) {
    console.log("Database connection failed", e);
  }
};

// Websocket
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Xử lý tham gia phòng chat
  socket.on('joinConversation', ({ conversationId }) => {
      socket.join(conversationId);
  });

  // Xử lý khi client gửi tin nhắn
  socket.on('sendMessage', async ({messageId, conversationId, senderId, message }) => {

    const {isValid, newMessage} = await require('./apps/conversation/services').isValidMessage(messageId, conversationId, senderId, message);

    if(isValid) io.to(conversationId).emit('receiveMessage', newMessage);
  });

  socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;

(async () => {
  await connectDB();
  // Khởi động server
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
})();
