const {
  addNewEmptyServer,
  addDefaultCategories,
} = require("../services/serverService");
const { addServerIdToMembers } = require("../services/userService");
const { addNewEmptyChat } = require("../services/chatService");
const { ResponseCodes, Strings } = require("../utils/constants");

const serverController = {
  async createNewServer(req, res) {
    const serverName = req.body.serverName;
    const adminUserId = req.body.adminUserId;
    const memberListFromBody = req.body.memberList ?? [adminUserId];
    const memberList =
      memberListFromBody.length > 0 ? memberListFromBody : [adminUserId];
    if (!serverName || !adminUserId) {
      res.status(ResponseCodes.BAD_REQUEST).send(Strings.BAD_REQUEST);
      return;
    }
    try {
      console.log("adding 1");
      const serverId = await addNewEmptyServer(
        serverName,
        adminUserId,
        memberList
      );
      console.log("adding 2");

      const defaultMessageChannelChatId = await addNewEmptyChat();
      await addDefaultCategories(serverId, defaultMessageChannelChatId);
      console.log("adding 3");
      await addServerIdToMembers(serverId, memberList);
      console.log("adding 4");
      res.status(ResponseCodes.SUCCESS).end();
    } catch (err) {
      console.log(err);
      res
        .status(ResponseCodes.INTERNAL_SERVER_ERROR)
        .send(Strings.INTERNAL_SERVER_ERROR);
    }
  },
};

module.exports = serverController;
