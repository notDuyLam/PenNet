const multer = require("multer");
const { cloudinary } = require("../untils/cloudinaryConfig");

const uploadPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30_000_000 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload an image."), false);
    }
  },
});

const uploadToCloudinary = (buffer, option = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(option, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      })
      .end(buffer);
  });
};

const resizeAndUploadImage = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new Error("No files uploaded!"));
  }

  try {
    const uploadPromises = req.files.map(async (file) => {
      const result = await uploadToCloudinary(file.buffer, {
        folder: "uploads",
        resource_type: "image",
        transformation: [{ width: 500, height: 500, crop: "limit" }],
      });
      return result;
    });

    const results = await Promise.all(uploadPromises);
    req.imageUrls = results.map((result) => result.url);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadPhoto, resizeAndUploadImage };
