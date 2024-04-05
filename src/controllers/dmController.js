const { ResponseCodes, Strings } = require("../utils/constants");
const { addNewDm } = require("../services/dmService");
const { addDmToUsers } = require("../services/userService");
const { addNewEmptyChatWithChatId } = require("../services/chatService");


const {
  getErrorJson
} = require("../utils/responseUtils")

const dmController = {
  async addNewDm(req, res) {
    const memberList = req.body.memberList;
    if (!memberList || memberList.length < 2) {
      res.status(ResponseCodes.BAD_REQUEST).json(getErrorJson(Strings.BAD_REQUEST));
      return;
    }
    try {
      const chatId = await addNewDm(memberList);
      await addDmToUsers(chatId, memberList);
      await addNewEmptyChatWithChatId(chatId);
      res.status(ResponseCodes.SUCCESS).end();
    } catch (err) {
      console.log(err);
      res
        .status(ResponseCodes.INTERNAL_SERVER_ERROR)
        .json(getErrorJson(Strings.INTERNAL_SERVER_ERROR));
    }
  },
};

module.exports = dmController;
