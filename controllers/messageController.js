const asyncHandler = require("express-async-handler");
const AppError = require("./../utils/appError");
const Message = require("./../models/messageModel");
const Conversation = require("./../models/conversationModel");

exports.sendMessage = asyncHandler(async (req, res, next) => {
  // Ormaybe get receiver's Id from the params
  const { message, receiverId } = req.body;
  const senderId = req.user._id;
  let conversation = await Conversation.findOne({
    participants: { $all: senderId, receiverId },
  });

  //   if no conversation exists create a new one
  if (!conversation) {
    conversation = new Conversation({ participants: [senderId, receiverId] });
  }

  const newMessage = new Message({
    senderId,
    receiverId,
    message,
  });

  if (newMessage) {
    conversation.messages.push(newMessage._id);
  }

  // SOCKET IO

  await Promise.all([conversation.save(), newMessage.save()]);

  res.status(201).json({
    status: "success",
    data: newMessage,
  });
});

exports.getMessages = asyncHandler(async (req, res, next) => {
  const { id: userToChat } = req.params;
  const senderId = req.user._id;
  //   Get the conversation to be able to get all their messages and populate
  const conversation = await Conversation.findOne({
    participants: { $all: senderId, userToChat },
  }).populate("messages");

  if (!conversation) {
    res.status(200).json({
      status: "success",
      data: [],
    });
  }

  res.status(200).json({
    status: "success",
    data: conversation.messages,
  });
});
