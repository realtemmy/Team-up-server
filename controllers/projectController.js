const asyncHandler = require("express-async-handler");
const multer = require("multer");
const Project = require("./../models/projectModel");
const User = require("./../models/userModel");
const AppError = require("./../utils/appError");
const cloudinaryUploader = require("./../utils/cloudinary");

// exports.uploadProjectPhoto = (req, res, next) => {
//   new cloudinaryUploader(req, "projects", 1200, 1200, "image")
//     .upload()
//     .single("image");

//   next();
// };

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

exports.uploadProjectPhoto = upload.single("image");

exports.uploadProjectToCloudinary = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No file uploaded!", 400));
  }
  const upload = new cloudinaryUploader(req, "projects", 1200, 1200, "image");
  const url = await upload.uploadImage();
  req.body.image = url;
  next();
});

exports.createProject = asyncHandler(async (req, res, next) => {
  const { name, desc, skills, contributors, url } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  const newProject = await Project.create({
    name,
    contributors,
    desc,
    skills,
    url,
    user: req.user.id,
  });
  // Add project's Id to user
  user.projects.push(newProject._id);
  // save user to DB
  await user.save({ validateBeforeSave: false });
  res.status(201).json({
    status: "success",
    data: newProject,
  });
});

exports.getProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  res.status(200).json({
    status: "success",
    data: project,
  });
});

exports.getAllprojects = asyncHandler(async (req, res) => {
  const projects = await Project.find();
  res.status(200).json({
    status: "success",
    length: projects.length,
    data: projects,
  });
});

exports.canPerformActionOnproject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return next(new AppError("No project with that ID found", 404));
  }

  // Compare ObjectIDs correctly
  if (!req.user._id.equals(project.user)) {
    return next(
      new AppError("Only the project owner can edit the project.", 403)
    );
  }

  next();
});

exports.updateProject = asyncHandler(async (req, res, next) => {
  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  res.status(200).json({
    status: "success",
    data: updatedProject,
  });
});
exports.deleteProject = asyncHandler(async (req, res, next) => {
  await Project.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});
