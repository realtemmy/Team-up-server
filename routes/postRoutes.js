const express = require("express");
const authController = require("./../controllers/authController");
const postController = require("./../controllers/postController");
const commentsRoutes = require("./commentRoutes");

const router = express.Router();

// Comments on Post
router.use("/:postId/comments", commentsRoutes);

router.get("/me", authController.protect, postController.getUsersPosts);
router.patch("/:postId/bookmark", authController.protect, postController.bookmarkPost);
router.get("/bookmarks", authController.protect, postController.getBookmarks)
router.patch("/:id/like", authController.protect, postController.likePost);

router
  .route("/")
  .get(postController.getAllPosts)
  .post(
    authController.protect,
    postController.uploadImages,
    postController.uploadToCloudinary,
    postController.createPost
  );

router
  .route("/:id")
  .get(authController.protect, postController.getPost)
  .patch(
    authController.protect,
    postController.canPerformAction,
    postController.updatePost
  )
  .delete(
    authController.protect,
    postController.canPerformAction,
    postController.deletePost
  );

module.exports = router;
