const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      validate: {
        validator: function (v) {
          return v.length >= 2; // At least 2 participants
        },
        message: "A conversation must have at least two participants.",
      },
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries on participants
conversationSchema.index({ participants: 1 });

// Pre-query middleware for population
// conversationSchema.pre(/^find/, function (next) {
//   this.populate({ path: "participants", select: "name email" });
//   this.populate("messages");
//   next();
// });

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
