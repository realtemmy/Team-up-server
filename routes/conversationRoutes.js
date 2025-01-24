const express = require("express");
const authController = require("../controllers/authController");
const conversationController = require("../controllers/conversationController");

const router = express.Router();

router.get("/all", conversationController.getAllConversations);
router.get("/last", authController.protect, conversationController.getLastConversations);

router
  .route("/")
  .get(authController.protect, conversationController.getConversation);
router.get(
  "/:id/lastMessage",
  authController.protect,
  conversationController.getLastMessageFromConversation
);

module.exports = router;
