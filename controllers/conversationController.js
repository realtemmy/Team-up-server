const asyncHandler = require("express-async-handler");
const AppError = require("./../utils/appError");
const Conversation = require("./../models/conversationModel");

exports.getAllConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find();

  res.status(200).json({
    status: "success",
    data: conversations,
  });
});

exports.getConversation = asyncHandler(async (req, res) => {
  const { receiverId } = req.body;
  const conversation = await Conversation.find({
    participants: { $all: [req.user._id, receiverId] },
  });
  res.status(200).json({
    status: "success",
    data: conversation,
  });
});

exports.getLastConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  }).populate({
    path: "messages",
    options: { sort: { createdAt: -1 }, limit: 1 },
  });
  res.status(200).json({
    status: "success",
    data: conversations,
  })
});

exports.getLastMessageFromConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id).populate({
    path: "messages",
    options: { sort: { createdAt: -1 }, limit: 1 },
  });

  res.status(200).json({
    status: "success",
    data: conversation,
  });
});
