const asyncHandler = require("express-async-handler");
const Post = require("./../models/postModel");
const AppError = require("./../utils/appError");
const Comment = require("./../models/commentModel");

exports.getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find();
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
  await Post.create({
    post: req.body.post,
    userId: req.user._id,
  });
  res.status(201).json({
    status: "success",
    message: "Post has been sent successfully",
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
