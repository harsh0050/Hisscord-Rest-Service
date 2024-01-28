const { ResponseCodes, Strings } = require("../utils/constants");
const { deleteChat } = require("../services/chatService");


// app.post("/chat", async (req, res) => {
//   const chatId = req.body.chatId;
//   if (!chatId) {
//     res.status(ResponseCodes.BAD_REQUEST).send("Chat ID not provided.");
//     return;
//   }
//   try {
//     await addNewEmptyChatWithChatId(chatId);
//     res.status(ResponseCodes.SUCCESS).end();
//   } catch (err) {
//     console.log(err);
//     res
//       .status(ResponseCodes.INTERNAL_SERVER_ERROR)
//       .send(Strings.INTERNAL_SERVER_ERROR);
//   }
// });


// app.delete("/chat", async (req, res) => {
//   const chatId = req.body.chatId;
//   if (!chatId) {
//     res.status(ResponseCodes.BAD_REQUEST).send("Chat ID not provided.");
//     return;
//   }
//   try {
//     await deleteChat(chatId);
//     res.status(ResponseCodes.SUCCESS).end();
//   } catch (err) {
//     console.log(err);
//     res
//       .status(ResponseCodes.INTERNAL_SERVER_ERROR)
//       .send(Strings.INTERNAL_SERVER_ERROR);
//   }
// });
