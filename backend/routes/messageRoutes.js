const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getMessagesWithUser,
  getConversations,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", sendMessage);
router.get("/conversations", getConversations);
router.get("/:userId", getMessagesWithUser);

module.exports = router;
