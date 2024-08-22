const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const AppError = require("../utils/appError");

exports.getAllOtherUsers = asyncHandler(async (req, res, next) => {
  // Or maybe find a way to get recent conversations
  // const users = await User.find({ _id: { $ne: req.user._id } }); //remove password maybe with select("-password")
  const users = await User.find();
  res.status(200).json({
    status: "success",
    data: users,
  });
});

exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("projects");
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
  const { name, email, bio, projects, education, certifications } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { name, email, bio, projects, education, certifications },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "message",
    data: updatedUser,
  });
});
