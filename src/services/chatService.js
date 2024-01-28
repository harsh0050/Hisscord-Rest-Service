const { firestore } = require("../utils/firebaseSetup");
const {
  doc,
  addDoc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
} = require("firebase/firestore");
const { PathConstants } = require("../utils/constants");
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
}

module.exports = {
  addNewEmptyChat,
  addNewEmptyChatWithChatId,
  deleteChat,
};
