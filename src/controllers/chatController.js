const {
  ResponseCodes,
  Strings,
  ProcessStatusCodes,
  ChatConstants,
} = require("../utils/constants");
const { addNewMessage } = require("../services/chatService");

const chatController = {
  async addMessage(req, res) {
    const chatId = req.params.chatId;
    const body = req.body;
    const mimeType = body.mimeType;
    const sentBy = body.sentBy;
    const content = body.content;

    if (!(chatId && mimeType && sentBy)) {
      res.status(ResponseCodes.BAD_REQUEST).send(Strings.BAD_REQUEST);
      return;
    }
    if (mimeType == ChatConstants.MIME_IMAGE && !content.image) {
      res.status(ResponseCodes.BAD_REQUEST).send("Please provide the image.");
      return;
    }
    if (mimeType == ChatConstants.MIME_TEXT && !content.text) {
      res.status(ResponseCodes.BAD_REQUEST).send("Please provide the text.");
      return;
    }
    if (
      mimeType != ChatConstants.MIME_TEXT &&
      mimeType != ChatConstants.MIME_IMAGE
    ) {
      res.status(ResponseCodes.BAD_REQUEST).send("Invalid MIME Type");
      return;
    }

    try {
      const exists = await findChatByChatId(chatId);
      if (!exists) {
        res
          .status(ResponseCodes.NOT_FOUND)
          .send("Chat with given ID not found.");
        return;
      }
      await addNewMessage(chatId, mimeType, sentBy, content);
      
      res.status(ResponseCodes.SUCCESS).end();
    } catch (err) {
      console.log(err);
      res
        .status(ResponseCodes.INTERNAL_SERVER_ERROR)
        .send(Strings.INTERNAL_SERVER_ERROR);
    }
  },
  async getUnreadMessage(req, res) {
    const chatId = req.params.chatId;
    const userId = req.body.userId;

    if (!userId) {
      req.status(ResponseCodes.BAD_REQUEST).send(Strings.BAD_REQUEST);
      return;
    }

    
  },
};

module.exports = chatController;
