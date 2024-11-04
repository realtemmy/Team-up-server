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
  const {
    name,
    desc,
    skills,
    contributors,
    repoUrl,
    liveUrl,
    summary,
    skillLevel,
    type,
  } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  const newProject = await Project.create({
    name,
    contributors,
    desc,
    skills,
    type,
    links: {
      liveUrl,
      repoUrl,
    },
    user: req.user.id,
    summary,
    skillLevel,
  });
  // Add project's Id to user
  user.projects.push(newProject._id);
  // save user to DB
  await user.save({ validateBeforeSave: false });
  res.status(201).json({
    status: "success",
    data: newProject._id,
  });
});

exports.getProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return next(new AppError("No project with ID found.", 404));
  }
  res.status(200).json({
    status: "success",
    data: project,
  });
});

exports.getAllprojects = asyncHandler(async (req, res) => {
  const projects = await Project.find().select(
    "name summary skills type status"
  );
  res.status(200).json({
    status: "success",
    length: projects.length,
    data: projects,
  });
});

exports.getAllUserProjects = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  // Check for where user is a contributor or the creator
  const projects = await Project.find({
    $or: [{ user: userId }, { contributors: userId }],
  }).select("name slug");

  res.status(200).json({
    status: "success",
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

exports.joinRequest = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const project = await Project.findById(req.params.id);
  // Add user to request if not already present
  if (!project.requests.some((request) => request.userId.equals(userId))) {
    project.requests.push({ userId });
    await project.save();
  }

  res.status(200).json({
    status: "success",
    message: "Request sent successfully",
  });
});

exports.manageRequest = asyncHandler(async (req, res, next) => {
  const { userId, action } = req.body;
  const project = await Project.findById(req.params.id);
  //
  const requestIndex = project.requests.findIndex((req) =>
    req.userId.equals(userId)
  );

  if (requestIndex === -1) {
    return next(new AppError("Request not found", 404));
  }
  if (action === "accept") {
    project.contributors.push(userId);
  }

  project.requests.splice(requestIndex, 1);
  await project.save();
  res.status(200).json({
    status: "success",
    message: `User ${action}ed successfully`,
  });
});
