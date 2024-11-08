const express = require("express");
const authController = require("../controllers/authController");
const commentController = require("../controllers/commentController");

const router = express.Router({ mergeParams: true });

router.patch(
  "/:commentId/like",
  authController.protect,
  commentController.likeComment
);

router
  .route("/")
  .get(commentController.getAllComments)
  .post(authController.protect, commentController.createComment);

router
  .route("/:commentId")
  .get(commentController.getComment)
  .put(
    authController.protect,
    commentController.canPerformAction,
    commentController.updateComment
  )
  .delete(
    authController.protect,
    commentController.canPerformAction,
    commentController.deleteComment
  );

module.exports = router;
