const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      required: true,
    },
    senderName: {
      type: String,
      default: "",
    },
    receiverName: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      required: [true, "Message text cannot be empty"],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    conversationId: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate conversationId before saving
messageSchema.pre("save", function () {
  if (this.sender && this.receiver) {
    const ids = [this.sender.toString(), this.receiver.toString()].sort();
    this.conversationId = `${ids[0]}_${ids[1]}`;
  }
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
