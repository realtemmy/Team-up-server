const express = require("express");

const authController = require("./../controllers/authController");
const messageController = require("./../controllers/messageController");

const router = express.Router();

// router.get("/user", authController.protect, messageController.getChatMessages);

router
  .route("/")
  .get(authController.protect, messageController.getPreviewMessages)
  .post(authController.protect, messageController.sendMessage);

router
  .route("/:id")
  .get(authController.protect, messageController.getChatMessages)
  .patch(authController.protect, messageController.editMessage);

module.exports = router;
