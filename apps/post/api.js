const express = require("express");
const router = express.Router();

const {
  uploadPhoto,
  resizeAndUploadImage,
} = require("../../middlewares/imageUploadMiddleware");

module.exports = router;
