const { firestore } = require("../utils/firebaseSetup");
const { collection, addDoc } = require("firebase/firestore");
const { PathConstants, DmConstants } = require("../utils/constants");

const dmCollection = collection(firestore, PathConstants.DIRECT_MESSAGE);

async function addNewDm(memberList) {
  const docRef = await addDoc(dmCollection, {
    [DmConstants.MEMBER_LIST]: memberList,
    [DmConstants.CREATED_AT]: new Date().getTime()
  });

  const chatId = docRef.id;
  return chatId;
}

module.exports = {
    addNewDm
}