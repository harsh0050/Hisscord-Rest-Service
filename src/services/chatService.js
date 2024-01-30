const { firestore } = require("../utils/firebaseSetup");
const {
  doc,
  addDoc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  getDoc,
  query,
  where,
} = require("firebase/firestore");
const {
  PathConstants,
  ChatConstants,
  DataStatusCodes,
} = require("../utils/constants");
const chatCollection = collection(firestore, PathConstants.CHAT);

async function addNewEmptyChat() {
  const docRef = await addDoc(chatCollection, {});
  return docRef.id;
}

async function addNewEmptyChatWithChatId(chatId) {
  const docRef = doc(firestore, PathConstants.CHAT, chatId);
  await setDoc(docRef, {});
}

async function deleteChat(chatId) {
  const msgCollRef = collection(
    firestore,
    PathConstants.CHAT,
    chatId,
    PathConstants.MESSAGE
  );
  const querySnap = await getDocs(msgCollRef);
  await Promise.all(
    querySnap.docs.map(async (docSnap) => {
      return deleteDoc(docSnap);
    })
  );
  await deleteDoc(doc(firestore, PathConstants.CHAT, chatId));
}

async function findChatByChatId(chatId) {
  const docRef = doc(firestore, PathConstants.CHAT, chatId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
}

async function addNewMessage(chatId, mimeType, sentBy, content) {
  const msgCollRef = collection(
    firestore,
    PathConstants.CHAT,
    chatId,
    PathConstants.MESSAGE
  );

  const msgContent =
    mimeType == ChatConstants.MIME_TEXT
      ? {
          [ChatConstants.TEXT]: content.text,
        }
      : {
          [ChatConstants.TEXT]: content.text ?? "",
          [ChatConstants.IMAGE]: content.image,
        };
  const msg = {
    [ChatConstants.MIME_TYPE]: mimeType,
    [ChatConstants.STATUS]: DataStatusCodes.STATUS_NEW,
    [ChatConstants.SENT_BY]: sentBy,
    [ChatConstants.SEEN_BY]: [sentBy],
    [ChatConstants.CONTENT]: msgContent,
    [ChatConstants.TIMESTAMP]: new Date().getTime(),
  };
  await addDoc(msgCollRef, msg);
}

async function getUnreadMessage(chatId, userId){
  const collRef = collection(firestore, PathConstants.CHAT, chatId, PathConstants.MESSAGE);
}

module.exports = {
  addNewEmptyChat,
  addNewEmptyChatWithChatId,
  findChatByChatId,
  deleteChat,
  addNewMessage,
};
