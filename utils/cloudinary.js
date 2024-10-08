const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const AppError = require("./appError");

cloudinary.config({
  cloud_name: "dyrcpslwb",
  api_key: 564269647271827,
  api_secret: "Wi73vJpnaEl_a2brUcxADpFd3Sw",
});

class cloudinaryUploader {
  constructor(req, folder, width, height, filetype) {
    (this.req = req),
      (this.folder = folder),
      (this.width = width),
      (this.height = height),
      (this.filetype = filetype || "image");
  }
  multerFilter(req, file, cb) {
    if (file.mimetype.startsWith(this.filetype)) {
      cb(null, true);
    } else {
      cb(new AppError("Not an image. Please upload only images.", 415), false);
    }
  }

  upload() {
    const upload = multer({
      storage: multer.memoryStorage,
      fileFilter: this.multerFilter.bind(this),
    });
    return upload;
  }

  async uploadImage() {
    const b64 = Buffer.from(this.req.file.buffer).toString("base64");
    const dataURI = "data:" + this.req.file.mimetype + ";base64," + b64;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: this.folder,
      width: this.width,
      height: this.height,
      crop: "fill",
      quality: "auto:good",
      format: "jpg",
    });
    return result.secure_url;
  }
  async deleteImage() {
    // Get publicId
    await cloudinary.uploader.destroy("publicId")
  }
  async updateImage() {
    // Delete current image if it exists
    await this.deleteImage();

  }
}

module.exports = cloudinaryUploader;
