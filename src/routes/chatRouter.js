const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

router.post("/:chatId", chatController.addMessage);
router.get("/:chatId", chatController.getUnreadMessage);
router.patch("/:chatId/:messageId", chatController.updateMessage);
router.delete("/:chatId/:messageId", chatController.deleteMessage);

module.exports = router;
