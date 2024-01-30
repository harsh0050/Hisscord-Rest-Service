const { firestore } = require("../utils/firebaseSetup");
const { collection, addDoc, doc, getDoc } = require("firebase/firestore");
const {
  PathConstants,
  DmConstants,
  ProcessStatusCodes,
} = require("../utils/constants");

const dmCollection = collection(firestore, PathConstants.DIRECT_MESSAGE);

async function addNewDm(memberList) {
  const docRef = await addDoc(dmCollection, {
    [DmConstants.MEMBER_LIST]: memberList,
    [DmConstants.CREATED_AT]: new Date().getTime(),
  });

  const chatId = docRef.id;
  return chatId;
}

async function getDmMemberList(dmId) {
  const dmDoc = await getDoc(
    doc(firestore, PathConstants.DIRECT_MESSAGE, dmId)
  );
  if (!dmDoc.exists()) {
    return {
      statusCode: ProcessStatusCodes.NOT_FOUND,
      content: "DM with given ID does not exist.",
    };
  }
  return {
    statusCode: ProcessStatusCodes.FOUND,
    content: dmDoc.data().memberList,
  };
}

module.exports = {
  addNewDm,
  getDmMemberList,
};
