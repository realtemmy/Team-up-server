const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const asyncHandler = require("express-async-handler");
const Post = require("./../models/postModel");
const AppError = require("./../utils/appError");
const Comment = require("./../models/commentModel");

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

exports.uploadImages = upload.array("images", 5);

exports.uploadToCloudinary = asyncHandler(async (req, res, next) => {
  if (!req.files) {
    next();
  }
  // console.log("Files: ",req.files);

  const images = [];
  await Promise.all(
    req.files.map(async (image) => {
      const b64 = Buffer.from(image.buffer).toString("base64");
      const dataURI = "data:" + image.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "posts",
        width: 1000,
        height: 1000,
      });
      images.push(result.secure_url);
    })
  );
  console.log("Posts: ", images);
  req.body.images = images;
  next();
});

exports.getAllPosts = asyncHandler(async (req, res) => {
  // populate users name
  const posts = await Post.find().populate("userId", "name photo");
  res.status(200).json({
    status: "success",
    data: posts,
  });
});

exports.getUsersPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ userId: req.user._id });
  res.status(200).json({
    status: "success",
    data: posts,
  });
});

exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError("No post with Id found", 404));
  }
  res.status(200).json({
    status: "success",
    data: post,
  });
});

exports.createPost = asyncHandler(async (req, res, next) => {
  const post = await Post.create({
    post: req.body.post,
    userId: req.user._id,
    images: req.body.images,
  });
  res.status(201).json({
    status: "success",
    data: post,
  });
});

exports.updatePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!post) {
    return next(new AppError("No post with ID found", 404));
  }

  res.status(202).json({
    status: "success",
    message: "Post has been edited successfully",
  });
});

exports.likePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $addToSet: { likedBy: req.user._id },
      $inc: { likesCount: 1 },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!post) {
    return next(new AppError("No post with ID found", 404));
  }

  res.status(200).json({
    status: "success",
  });
});

exports.canPerformAction = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post.userId.equals(req.user._id)) {
    return next(new AppError("Sorry, you cannot perform this action", 403));
  }
  next();
});

exports.deletePost = asyncHandler(async (req, res, next) => {
  // Verify who's deleting post
  // Delete all comments on post
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) {
    return next(new AppError("No post with ID found.", 404));
  }

  // await Promise.all()
  await Promise.all(
    post.comments.map(
      async (commentId) => await Comment.findByIdAndDelete(commentId)
    )
  );

  res.status(204).json({
    status: "success",
    data: null,
  });
});
