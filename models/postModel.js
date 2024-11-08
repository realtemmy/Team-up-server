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
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
