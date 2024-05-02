const {
  addNewEmptyServer,
  addDefaultCategories,
  addNewEmptyCategory,
  deleteCategory,
  addNewChannel,
  deleteChannelByChatId,
  getCategoryById,
  getServerById,
} = require("../services/serverService");
const { addServerIdToMembers } = require("../services/userService");
const {
  addNewEmptyChat,
  deleteChat,
  findChatByChatId,
} = require("../services/chatService");
const {
  ResponseCodes,
  Strings,
  ProcessStatusCodes,
  ServerConstants,
} = require("../utils/constants");


const {
  getErrorJson
} = require("../utils/responseUtils")

const serverController = {
  async createNewServer(req, res) {
    const serverName = req.body.serverName;
    const adminUserId = req.body.adminUserId;
    const memberListFromBody = req.body.memberList ?? [adminUserId];
    const memberList =
      memberListFromBody.length > 0 ? memberListFromBody : [adminUserId];
    if (!serverName || !adminUserId) {
      res.status(ResponseCodes.BAD_REQUEST).json(getErrorJson(Strings.BAD_REQUEST));
      return;
    }
    try {
      const serverId = await addNewEmptyServer(
        serverName,
        adminUserId,
        memberList
      );

      const defaultMessageChannelChatId = await addNewEmptyChat();
      await addDefaultCategories(serverId, defaultMessageChannelChatId);
      await addServerIdToMembers(serverId, memberList);
      res.status(ResponseCodes.SUCCESS).end();
    } catch (err) {
      console.log(err);
      res
        .status(ResponseCodes.INTERNAL_SERVER_ERROR)
        .json(getErrorJson(Strings.INTERNAL_SERVER_ERROR));
    }
  },

  async createNewCategory(req, res) {
    const serverId = req.body.serverId;
    const categoryName = req.body.categoryName;
    if (!serverId || !categoryName) {
      res.status(ResponseCodes.BAD_REQUEST).json(getErrorJson(Strings.BAD_REQUEST));
      return;
    }

    try {
      const result = await getServerById(serverId);
      if(result.statusCode!= ProcessStatusCodes.FOUND){
        res.status(ResponseCodes.NOT_FOUND).json(getErrorJson(result.content));
        return;
      }
      await addNewEmptyCategory(serverId, categoryName);
      res.status(ResponseCodes.SUCCESS).end();
    } catch (err) {
      console.log(err);
      res
        .status(ResponseCodes.INTERNAL_SERVER_ERROR)
        .json(getErrorJson(Strings.INTERNAL_SERVER_ERROR));
    }
  },

  async deleteCategory(req, res) {
    const serverId = req.body.serverId;
    const categoryId = req.body.categoryId;
    if (!serverId || !categoryId) {
      res.status(ResponseCodes.BAD_REQUEST).json(getErrorJson(Strings.BAD_REQUEST));
      return;
    }

    try {
      const result = await getCategoryById(serverId, categoryId);
      if (result.statusCode == ProcessStatusCodes.NOT_FOUND) {
        res.status(ResponseCodes.NOT_FOUND).json(getErrorJson(result.content));
        return;
      }
      const chatIdList = await deleteCategory(result.content);

      await Promise.all(
        chatIdList.map(async (chatId) => {
          if (await findChatByChatId(chatId)) {
            await deleteChat(chatId);
          }
        })
      );
      console.log("deleted");

      res.status(ResponseCodes.SUCCESS).end();
    } catch (err) {
      console.log(err);
      res
        .status(ResponseCodes.INTERNAL_SERVER_ERROR)
        .json(getErrorJson(Strings.INTERNAL_SERVER_ERROR));
    }
  },

  async createNewChannel(req, res) {
    const serverId = req.body.serverId;
    const categoryId = req.params.categoryId;
    const channelName = req.body.channelName;
    var channelType = req.body.channelType;
    
    if (!(serverId && categoryId && channelName && channelType)) {
      res.status(ResponseCodes.BAD_REQUEST).json(getErrorJson(Strings.BAD_REQUEST));
      return;
    }

    channelType = parseInt(channelType)
    if(!channelName){
      res.status(ResponseCodes.BAD_REQUEST).json(getErrorJson(Strings.BAD_REQUEST));
      return;
    }

    try {
      let chatId;
      if (channelType == ServerConstants.CHANNEL_TEXT) {
        chatId = await addNewEmptyChat();
      }
      
      const result = await getCategoryById(serverId, categoryId);

      if (result.statusCode == ProcessStatusCodes.NOT_FOUND) {
        res
          .status(ResponseCodes.NOT_FOUND)
          .json(getErrorJson("Server or category with given ID not found."));
        return;
      }
      console.log("chatId :"+ chatId)
      await addNewChannel(result.content, chatId, channelName, channelType);

      res.status(ResponseCodes.SUCCESS).end();
    } catch (err) {
      console.log(err);
      res
        .status(ResponseCodes.INTERNAL_SERVER_ERROR)
        .json(getErrorJson(Strings.INTERNAL_SERVER_ERROR));
    }
  },

  async deleteChannel(req, res) {
    console.log("deleting");
    const serverId = req.body.serverId;
    const categoryId = req.params.categoryId;
    const chatId = req.body.chatId;

    if (!(serverId && categoryId && chatId)) {
      res.status(ResponseCodes.BAD_REQUEST).json(getErrorJson(Strings.BAD_REQUEST));
      return;
    }

    try {
      const result = await getCategoryById(serverId, categoryId);

      if (result.statusCode == ProcessStatusCodes.NOT_FOUND) {
        res
          .status(ResponseCodes.NOT_FOUND)
          .json(getErrorJson("Category with provided ID does not exist."));
        return;
      }
      const deletedChannel = await deleteChannelByChatId(
        serverId,
        categoryId,
        chatId
      );
      if (deletedChannel.channelType == ServerConstants.CHANNEL_TEXT) {
        if (!findChatByChatId(chatId)) {
          res
            .status(ResponseCodes.NOT_FOUND)
            .json(getErrorJson("Chat with given ID not found."));
          return;
        }
        await deleteChat(chatId);
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

module.exports = serverController;
