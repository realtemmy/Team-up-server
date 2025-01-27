const asyncHandler = require("express-async-handler");
const multer = require("multer");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const cloudinaryUploader = require("./../utils/cloudinary");

// exports.uploadUserPhoto = asyncHandler(async(req, res, next) => {
//   const uploader = new cloudinaryUploader(req, "users", 500, 500, "image");
//   const upload = uploader.upload().single("photo");
//   next()
// })
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

exports.uploadProfileToCloudinary = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return new AppError("No file uploaded!", 400);
  }
  // Start by deleting the previous  image url, then upload the new one
  const upload = new cloudinaryUploader(req, "users", 1200, 1200, "image");
  const url = await upload.uploadImage();
  console.log("Url: ", url);
  // req.body.photo = url; // update only image
  await User.findByIdAndUpdate(
    req.user.id,
    { photo: url },
    { runValidators: true, new: true }
  );
  res.status(200).json({
    status: "success",
    data: url,
  });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    length: users.length,
    data: users,
  });
});

exports.searchUserByNameAndEmail = asyncHandler(async (req, res, next) => {
  // Search value in both email and name
  const { search } = req.query;

  if(!search) {
    return next(new AppError("Please provide a search value", 400));
  }
const users = await User.find({
  $or: [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ],
  _id: { $ne: req.user._id },
}).select("name email photo");

  res.status(200).json({
    status: "success",
    data: users,
  });
});

exports.getAllOtherUsers = asyncHandler(async (req, res, next) => {
  // Or maybe find a way to get recent conversations
  const users = await User.find({ _id: { $ne: req.user._id } }).select(
    "email name photo"
  );
  res.status(200).json({
    status: "success",
    data: users,
  });
});

exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.updateUserInfo = asyncHandler(async (req, res, next) => {
  // Don't allow updating of passwords
  if (req.body.password || req.body.confirmPassword) {
    return next(new AppError("This route is now for password update.", 400));
  }

  // Then you can update all other stuffs
  const { name, email, bio, projects, education, certifications, phone } =
    req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { name, email, bio, phone },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "message",
    data: updatedUser,
  });
});

exports.deleteProfilePhoto = asyncHandler(async (req, res, next) => {
  const cloudinary = new cloudinaryUploader(req);
});
