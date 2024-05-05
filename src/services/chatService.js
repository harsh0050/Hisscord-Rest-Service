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
  updateDoc,
} = require("firebase/firestore");
const {
  PathConstants,
  ChatConstants,
  DataStatusCodes,
  ProcessStatusCodes,
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

async function addNewMessage(
  chatId,
  mimeType,
  sentBy,
  content,
  chatMemberList
) {
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
    [ChatConstants.NOT_SEEN_BY]: chatMemberList,
    [ChatConstants.CONTENT]: msgContent,
    [ChatConstants.TIMESTAMP]: new Date().getTime(),
  };
  await addDoc(msgCollRef, msg);
}

async function getUnreadMessage(chatId, userId) {
  const msgCollRef = collection(
    firestore,
    PathConstants.CHAT,
    chatId,
    PathConstants.MESSAGE
  );
  const q = query(
    msgCollRef,
    where(ChatConstants.NOT_SEEN_BY, "array-contains", userId)
  );
  const docs = await getDocs(q);
  const messages = [];
  docs.docs.forEach((docSnap) => {
    const docData = docSnap.data();

    const msg = {
      [ChatConstants.MESSAGE_ID]: docSnap.id,
      [ChatConstants.MIME_TYPE]: docData.mimeType,
      [ChatConstants.STATUS]: docData.status,
      [ChatConstants.SENT_BY]: docData.sentBy,
      [ChatConstants.CONTENT]: docData.content,
      [ChatConstants.TIMESTAMP]: docData.timestamp,
    };
    messages.push(msg);
  });
  return messages;
}

async function updateMessage(chatId, messageId, text, memberList) {
  const docSnap = await getMessageById(chatId, messageId);
  if (!docSnap.exists()) {
    return ProcessStatusCodes.NOT_FOUND;
  }
  const content = docSnap.data().content;
  content.text = text;
  await updateDoc(docSnap.ref, {
    [ChatConstants.CONTENT]: content,
    [ChatConstants.STATUS]: DataStatusCodes.STATUS_EDITED,
    [ChatConstants.NOT_SEEN_BY]: memberList,
  });
  return ProcessStatusCodes.SUCCESS;
}

async function deleteMessageById(chatId, messageId, memberList) {
  const docSnap = await getMessageById(chatId, messageId);
  if (!docSnap.exists()) {
    return ProcessStatusCodes.NOT_FOUND;
  }

  await updateDoc(docSnap.ref, {
    [ChatConstants.CONTENT]: {},
    [ChatConstants.STATUS]: DataStatusCodes.STATUS_DELETED,
    [ChatConstants.NOT_SEEN_BY]: memberList,
  });
  return ProcessStatusCodes.SUCCESS;
}

async function getMessageById(chatId, messageId) {
  const docSnap = await getDoc(
    doc(firestore, PathConstants.CHAT, chatId, PathConstants.MESSAGE, messageId)
  );
  return docSnap;
}

async function updateNotSeenBy(messageId, chatId, newNotSeenBy) {
  const docRef = doc(
    firestore,
    PathConstants.CHAT,
    chatId,
    PathConstants.MESSAGE,
    messageId
  );
  await updateDoc(docRef, {
    [ChatConstants.NOT_SEEN_BY]: newNotSeenBy,
  });
}

async function getMessageCollectionByChatId(chatId) {
  const docs = await getDocs(
    collection(firestore, PathConstants.CHAT, chatId, PathConstants.MESSAGE)
  );
  return docs.docs;
}
module.exports = {
  addNewEmptyChat,
  addNewEmptyChatWithChatId,
  findChatByChatId,
  deleteChat,
  addNewMessage,
  getUnreadMessage,
  updateMessage,
  deleteMessageById,
  updateNotSeenBy,
  getMessageCollectionByChatId
};
