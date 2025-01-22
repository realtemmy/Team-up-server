const asyncHandler = require("express-async-handler");
const AppError = require("./../utils/appError");
const Message = require("./../models/messageModel");
const Conversation = require("./../models/conversationModel");

exports.sendMessage = asyncHandler(async (req, res, next) => {
  // Or maybe get receiver's Id from the params
  const { message, receiverId } = req.body;
  const senderId = req.user._id;
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  //   if no conversation exists create a new one
  if (!conversation) {
    conversation = new Conversation({ participants: [senderId, receiverId] });
  }

  const newMessage = new Message({
    sender: senderId,
    receiver: receiverId,
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

exports.getPreviewMessages = asyncHandler(async (req, res, next) => {
  // How do I pick just the last message from receiver's messages

  const senderId = req.user._id;
  const conversations = await Conversation.find({
    participants: { $in: [senderId] },
  }).populate("participants messages");

  res.status(200).json({
    status: "success",
    data: conversations,
  });
});

exports.getChatMessages = asyncHandler(async (req, res, next) => {
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

exports.updateMessageStatus = asyncHandler(async (req, res) => {
  const { messageId, status } = req.params;
  const message = await Message.findByIdAndUpdate(
    messageId,
    {
      status: status, // read or delivered
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: message,
  });
});

// Edit message
exports.editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const message = await Message.findByIdAndUpdate(
    messageId,
    {
      message: req.body.message,
      updatedTextAt: Date.now(),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: message,
  });
});
