const { firestore } = require("../utils/firebaseSetup");
const {
  doc,
  addDoc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  getDoc,
} = require("firebase/firestore");
const { PathConstants, ProcessStatusCodes } = require("../utils/constants");
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
  console.log("deleting : ",chatId)
  console.log(await findChatByChatId(chatId));
  if(!await findChatByChatId(chatId)){
    return ProcessStatusCodes.NOT_FOUND;
  }
  const collRef = collection(
    firestore,
    PathConstants.CHAT,
    chatId,
    PathConstants.MESSAGE
  );
  const querySnap = await getDocs(collRef);
  await Promise.all(
    querySnap.docs.map(async (docSnap) => {
      return deleteDoc(docSnap);
    })
  );
  await deleteDoc(doc(firestore, PathConstants.CHAT, chatId));
  return ProcessStatusCodes.SUCCESS;
}

async function findChatByChatId(chatId) {
  const docRef = doc(firestore, PathConstants.CHAT, chatId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
}

module.exports = {
  addNewEmptyChat,
  addNewEmptyChatWithChatId,
  deleteChat,
};
