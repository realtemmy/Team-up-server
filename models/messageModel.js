const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
      required: [true, "Message to be send is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["sent", "delivered", "read"],
        message: "Status is either: sent, delivered, read",
      },
      default: "sent",
    },
    images: [
      {
        type: String,
      },
    ],
    updatedTextAt: {
      type: Date,
    }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
