const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController")

router.post("/:chatId", chatController.addMessage);
router.post("/:chatId", chatController.getUnreadMessage);

module.exports = router;