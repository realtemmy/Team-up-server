const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const asyncHandler = require("express-async-handler");
const Post = require("./../models/postModel");
const AppError = require("./../utils/appError");
const Comment = require("./../models/commentModel");
const User = require("../models/userModel");
const { create } = require("../models/conversationModel");

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
  const posts = await Post.find()
    .populate("userId", "name photo")
    .sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    data: posts,
  });
});

exports.getUsersPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });
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
  // const post = await Post.findByIdAndUpdate(
  //   req.params.id,
  //   {
  //     $addToSet: { likedBy: req.user._id },
  //     $inc: { likesCount: 1 },
  //   },
  //   {
  //     new: true,
  //     runValidators: true,
  //   }
  // );
const post = await Post.findById(req.params.id);

if (!post) {
  return next(new AppError("No post with ID found", 404));
}

if (post.likedBy.includes(req.user._id)) {
  // User has already liked the post, so unlike it
  post.likedBy = post.likedBy.filter(
    (userId) => userId.toString() !== req.user._id.toString()
  );
  post.likesCount -= 1;
} else {
  // User has not liked the post, so like it
  post.likedBy.push(req.user._id);
  post.likesCount += 1;
}

await post.save();

res.status(200).json({
  status: "success",
  data: post,
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

exports.getBookmarks = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("bookmarks");
  // postIds.map(async postId => await Post.findById(postId))
  // Fetch the bookmarked posts in the IDs in the bookmarks array
  const posts = await Post.find({ _id: { $in: user.bookmarks } });
  res.status(200).json({
    status: "success",
    length: posts.length,
    data: posts,
  });
});

exports.bookmarkPost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  // Check if the post exists
  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError("No post with the specified ID found", 404));
  }

  // Check if bookmark already exists for the user
  const user = await User.findOne({
    _id: req.user._id,
    bookmarks: { $elemMatch: { $eq: postId } },
  });

  if (user) {
    return next(new AppError("Post is already bookmarked", 400));
  }
  // Update both user and post in parallel
  const userUpdate = User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { bookmarks: postId } },
    { new: true }
  );

  const postUpdate = Post.findByIdAndUpdate(
    postId,
    { $addToSet: { bookmarkedBy: req.user._id } },
    { new: true }
  );

  await Promise.all([userUpdate, postUpdate]);

  res.status(200).json({
    status: "success",
    message: "Bookmarked successfully",
  });
});
