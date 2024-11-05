const express = require("express");
const authController = require("./../controllers/authController");
const postController = require("./../controllers/postController");

const router = express.Router();

router.get("/user", authController.protect, postController.getUsersPosts);
router.patch("/:id/like", authController.protect, postController.likePost);
router.patch(
  "/:id/comment",
  authController.protect,
  postController.commentOnPost
);

router
  .route("/")
  .get(postController.getAllPosts)
  .post(authController.protect, postController.createPost);

router
  .route("/:id")
  .get(authController.protect, postController.getPost)
  .patch(authController.protect, postController.updatePost)
  .delete(authController.protect, postController.deletePost);

module.exports = router;
