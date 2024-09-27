const asyncHandler = require("express-async-handler");
const User = require("./../models/userModel");
const AppError = require("./../utils/appError");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config({ path: "./../config.env" });

exports.signup = asyncHandler(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({
    status: "success",
    token,
    data: newUser,
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email exists in DB
  const user = await User.findOne({ email })
    // .populate("certifications")
    // .populate("projects")
    .select("+password");
  if (!user) {
    return next(new AppError("No user with email found", 404));
  }

  // Verify password using bcrypt
  const matches = await user.comparePasswords(password, user.password);
  if (!matches) {
    return next(new AppError("Incorrect email and password combination", 401));
  }

  user.password = undefined

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(200).json({
    status: "success",
    user,
    token,
  });
});

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("You're not logged in. Login to get access", 401));
  }
  // 2) Decode an get the users id
  const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
  // 3) Get user from decoded jwt id
  const user = await User.findById(decode.id);
  if (!user) {
    return next(
      new AppError(
        "The account belonging to this token does not exist. Please login again"
      )
    );
  }
  // 3) save users id
  req.user = user;
  next();
});

exports.googleSignUp = asyncHandler(async (req, res, next) => {
  // throw error if no email or name
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.picture,
  });

  await user.save({ validateBeforeSave: false });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(201).json({
    status: "success",
    token,
    data: user,
  });
});

exports.updatepassword = asyncHandler(async (req, res, next) => {
  const { password, newPassword, confirmNewPassword } = req.body;
  //   Get user current password
  const user = await User.findById(req.user._id).select("+password");

  const matches = await user.comparePasswords(password, user.password);
  if (!matches) {
    return next(new AppError("Passwords do not match", 400));
  }

  user.password = newPassword;
  user.confirmPassword = confirmNewPassword;
  await user.save();
  res.status(200).json({
    status: "success",
    data: user,
  });
});

// Forgot password
