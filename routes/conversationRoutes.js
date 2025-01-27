const express = require("express");
const authController = require("../controllers/authController");
const conversationController = require("../controllers/conversationController");

const router = express.Router();

router.get("/all", conversationController.getAllConversations);
router.get("/last", authController.protect, conversationController.getLastConversations);

router
  .route("/")
  .get(authController.protect, conversationController.getUserConversations);
router.get(
  "/:id/lastMessage",
  authController.protect,
  conversationController.getLastMessageFromConversation
);

router.route("/:id").get(authController.protect, conversationController.getConversation);

module.exports = router;
