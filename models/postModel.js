const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    post: {
      type: String,
      required: [true, "Post cannot be empty"],
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    photo: {
      type: String,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    comments: [
      // Maybe change to just comment count ?
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    bookmarkedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
