const {
  ResponseCodes,
  Strings,
  ProcessStatusCodes,
  ChatConstants,
} = require("../utils/constants");
const {
  addNewMessage,
  getUnreadMessage,
  findChatByChatId,
  updateMessage,
  deleteMessageById,
} = require("../services/chatService");
const { getServerMemberList } = require("../services/serverService");
const { getDmMemberList } = require("../services/dmService");

const {
  getErrorJson
} = require("../utils/responseUtils")

const chatController = {
  async addMessage(req, res) {
    const chatId = req.params.chatId;
    const body = req.body;
    const mimeType = body.mimeType;
    const sentBy = body.sentBy;
    const content = body.content;
    const serverId = body.serverId;

    if (!(chatId && mimeType && sentBy)) {
      res.status(ResponseCodes.BAD_REQUEST).json(getErrorJson(Strings.BAD_REQUEST));
      return;
    }
    if (mimeType == ChatConstants.MIME_IMAGE && !content.image) {
      res.status(ResponseCodes.BAD_REQUEST).json(getErrorJson("Please provide the image."));
      return;
    }
    if (mimeType == ChatConstants.MIME_TEXT && !content.text) {
      res.status(ResponseCodes.BAD_REQUEST).json(getErrorJson("Please provide the text."));
      return;
    }
    if (
      mimeType != ChatConstants.MIME_TEXT &&
      mimeType != ChatConstants.MIME_IMAGE
    ) {
      res.status(ResponseCodes.BAD_REQUEST).json(getErrorJson("Invalid MIME Type"));
      return;
    }

    try {
      const exists = await findChatByChatId(chatId);
      if (!exists) {
        res
          .status(ResponseCodes.NOT_FOUND)
          .json(getErrorJson("Chat with given ID not found."));
        return;
      }
      let result;
      if (serverId) {
        result = await getServerMemberList(serverId);
      } else {
        result = await getDmMemberList(chatId);
      }

      if (result.statusCode == ProcessStatusCodes.NOT_FOUND) {
        res.status(ResponseCodes.NOT_FOUND).json(getErrorJson(result.content));
        return;
      }

      const memberList = result.content;
      await addNewMessage(chatId, mimeType, sentBy, content, memberList);

      res.status(ResponseCodes.SUCCESS).end();
    } catch (err) {
      console.log(err);
      res
        .status(ResponseCodes.INTERNAL_SERVER_ERROR)
        .json(getErrorJson(Strings.INTERNAL_SERVER_ERROR));
    }
  },
  async getUnreadMessage(req, res) {
    const chatId = req.params.chatId;
    const userId = req.body.userId;

    if (!userId) {
      res.status(ResponseCodes.BAD_REQUEST).json(getErrorJson(Strings.BAD_REQUEST));
      return;
    }
    try {
      if (!(await findChatByChatId(chatId))) {
        res
          .status(ResponseCodes.NOT_FOUND)
          .json(getErrorJson("Chat with ID does not exist."));
        return;
      }
      const msgs = await getUnreadMessage(chatId, userId);
      res.status(ResponseCodes.SUCCESS).send(msgs);
    } catch (err) {
      console.log(err);
      res
        .status(ResponseCodes.INTERNAL_SERVER_ERROR)
        .json(getErrorJson(Strings.INTERNAL_SERVER_ERROR));
    }
  },

  async updateMessage(req, res) {
    const chatId = req.params.chatId;
    const messageId = req.params.messageId;

    if (!(chatId && messageId)) {
      res.status(ResponseCodes.BAD_REQUEST).json(getErrorJson(Strings.BAD_REQUEST));
      return;
    }
    const text = req.body.text;
    const serverId = req.body.serverId;

    try {
      let result;
      if (serverId) {
        result = await getServerMemberList(serverId);
      } else {
        result = await getDmMemberList(chatId);
      }

      if (result.statusCode == ProcessStatusCodes.NOT_FOUND) {
        res.status(ResponseCodes.NOT_FOUND).json(getErrorJson(result.content));
        return;
      }

      const memberList = result.content;
      const resultCode = await updateMessage(
        chatId,
        messageId,
        text,
        memberList
      );
      if (resultCode == ProcessStatusCodes.NOT_FOUND) {
        res
          .status(ResponseCodes.NOT_FOUND)
          .json(getErrorJson("Invalid Chat ID or Message ID provided."));
        return;
      }
      res.status(ResponseCodes.SUCCESS).end();
    } catch (err) {
      console.log(err);
      res
        .status(ResponseCodes.INTERNAL_SERVER_ERROR)
        .json(getErrorJson(Strings.INTERNAL_SERVER_ERROR));
    }
  },

  async deleteMessage(req, res) {
    const chatId = req.params.chatId;
    const messageId = req.params.messageId;
    if (!(chatId && messageId && req.body)) {
      res.status(ResponseCodes.BAD_REQUEST).json(getErrorJson(Strings.BAD_REQUEST));
      return;
    }
    let result;
    const serverId = req.body.serverId;

    try {
      if (serverId) {
        result = await getServerMemberList(serverId);
      } else {
        result = await getDmMemberList(chatId);
      }

      if (result.statusCode == ProcessStatusCodes.NOT_FOUND) {
        res.status(ResponseCodes.NOT_FOUND).json(getErrorJson(result.content));
        return;
      }

      const memberList = result.content;
      const resultCode = await deleteMessageById(chatId, messageId, memberList);
      if (resultCode == ProcessStatusCodes.NOT_FOUND) {
        res
          .status(ResponseCodes.NOT_FOUND)
          .json(getErrorJson("Invalid Chat ID or Message ID provided."));
        return;
      }
      res.status(ResponseCodes.SUCCESS).end();
    } catch (err) {
      console.log(err);
      res
        .status(ResponseCodes.INTERNAL_SERVER_ERROR)
        .json(getErrorJson(Strings.INTERNAL_SERVER_ERROR));
    }
  },
};

module.exports = chatController;
