const express = require("express");
const authController = require("./../controllers/authController");
const postController = require("./../controllers/postController");
const commentsRoutes = require("./commentRoutes");

const router = express.Router();

// Comments on Post
router.use("/:postId/comments", commentsRoutes);

router.get("/me", authController.protect, postController.getUsersPosts);
router.patch("/:id/like", authController.protect, postController.likePost);

router
  .route("/")
  .get(postController.getAllPosts)
  .post(authController.protect, postController.createPost);

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
