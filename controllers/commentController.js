const asyncHandler = require("express-async-handler");
const Comment = require("./../models/commentModel");
const AppError = require("./../utils/appError");
const Post = require("../models/postModel");

exports.getAllComments = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.params.postId) {
    filter = { post: req.params.postId };
  }
  const comments = await Comment.find(filter).populate("userId", "name photo");
  res.status(200).json({
    status: "success",
    data: comments,
  });
});

exports.createComment = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  // const comment = await Comment.create({
  //   userId: req.user._id,
  //   message: req.body.message,
  // });
  if (!postId) {
    return next(new AppError("ID for post missing", 404));
  }
  const comment = new Comment({
    comment: req.body.comment,
    post: postId,
    userId: req.user._id,
  });
  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError("No post found", 404));
  }
  await comment.save();
  post.comments.push(comment._id);
  await post.save();

  res.status(201).json({
    status: "success",
    data: comment,
  });
});

exports.getComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId).populate(
    "userId",
    "name photo"
  );
  if (!comment) {
    return next(new AppError("No comment with ID found", 404));
  }
  res.status(200).json({
    status: "success",
    data: comment,
  });
});

exports.likeComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findByIdAndUpdate(
    req.params.commentId,
    {
      $addToSet: { likedBy: req.user._id },
      $inc: { likesCount: 1 },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!comment) {
    return next(new AppError("No comment with ID found", 404));
  }

  res.status(200).json({
    status: "success",
  });
});

exports.updateComment = asyncHandler(async (req, res, next) => {
  const com = await Comment.findByIdAndUpdate(req.params.commentId, req.body, {
    runValidators: true,
    new: true,
  });
  res.status(200).json({
    status: "success",
    data: com,
  });
});

exports.canPerformAction = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) {
    return next(new AppError("No comment with ID found", 404));
  }
  if (!req.user._id.equals(comment.userId)) {
    return next(
      new AppError("Only the comment creator can perform action.", 403)
    );
  }
  next();
});

exports.deleteComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  // Remove Id from post
  const comment = await Comment.findByIdAndDelete(commentId);

  const post = await Post.findById({ comments: comment._id });
  post.comments.filter((comment) => comment !== commentId);
  await post.save();

  res.status(204).json({
    status: "success",
    data: null,
  });
});
