const multer = require("multer");
const { cloudinary } = require("../utils/cloudinaryConfig");

let uploadPhoto;
try {
  uploadPhoto = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100_000_000 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Not an image! Please upload an image."), false);
      }
    },
  });
} catch (error) {
  throw new Error(`Failed to initialize multer: ${error.message}`);
}

const uploadToCloudinary = async (buffer, option = {}) => {
  try {
    return await new Promise((resolve, reject) => {
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
  } catch (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

const resizeAndUploadImage = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
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
