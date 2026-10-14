const Message = require("../models/Message");
const User = require("../models/User");

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, text } = req.body;

    if (!receiverId || !text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID and message text are required",
      });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver user not found",
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiver._id,
      senderRole: req.user.role,
      senderName: req.user.name,
      receiverName: receiver.name,
      text: text.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages between logged-in user and another user
// @route   GET /api/messages/:userId
// @access  Private
const getMessagesWithUser = async (req, res, next) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    // Mark unread messages sent by other user as read
    await Message.updateMany(
      { sender: otherUserId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get summary list of all conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    // Find all messages involving current user
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    }).sort({ createdAt: -1 });

    const conversationMap = new Map();

    for (const msg of messages) {
      const otherUserIsReceiver = msg.sender.toString() === currentUserId.toString();
      const otherUserId = otherUserIsReceiver
        ? msg.receiver.toString()
        : msg.sender.toString();

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          userId: otherUserId,
          lastMessage: msg.text,
          lastMessageDate: msg.createdAt,
          lastSenderRole: msg.senderRole,
          unreadCount: (!msg.read && !otherUserIsReceiver) ? 1 : 0,
        });
      } else {
        if (!msg.read && !otherUserIsReceiver) {
          const conv = conversationMap.get(otherUserId);
          conv.unreadCount += 1;
        }
      }
    }

    // Populate user info for each conversation
    const conversations = [];
    for (const [userId, conv] of conversationMap.entries()) {
      const user = await User.findById(userId).select(
        "name email role avatar specialization phone"
      );
      if (user) {
        conversations.push({
          ...conv,
          user,
        });
      }
    }

    res.json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getMessagesWithUser,
  getConversations,
};
