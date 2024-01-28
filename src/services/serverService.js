const {firestore} = require("../utils/firebaseSetup");
const {ServerConstants, PathConstants, DataStatusCodes} = require("../utils/constants");
const {addDoc,collection} = require("firebase/firestore");

const serverCollection = collection(firestore, PathConstants.SERVER)


async function addNewEmptyServer(serverName, adminUserId, memberList) {
  const data = {
    [ServerConstants.SERVER_NAME]: serverName,
    [ServerConstants.ADMIN_USER_ID]: adminUserId,
    [ServerConstants.MEMBER_LIST]: memberList,
    [ServerConstants.CREATED_AT]: new Date().getTime(),
  };
  const docRef = await addDoc(serverCollection, data);
  const serverId = docRef.id;
  return serverId;
}

async function addDefaultCategories(serverId, defaultMessageChannelChatId) {
    const defaultMessageCategory = {
      [ServerConstants.CATEGORY_NAME]: "TEXT CHANNELS",
      [ServerConstants.CHANNEL_LIST]: [
        {
          [ServerConstants.CHAT_ID]: defaultMessageChannelChatId,
          [ServerConstants.CHANNEL_NAME]: "general",
          [ServerConstants.STATUS]: DataStatusCodes.STATUS_ACTIVE,
          [ServerConstants.CHANNEL_TYPE]: ServerConstants.CHANNEL_TEXT,
        },
      ],
    };
  
    const defaultVoiceCategory = {
      [ServerConstants.CHANNEL_NAME]: "VOICE CHANNELS",
      [ServerConstants.CHANNEL_LIST]: [
        {
          [ServerConstants.CHAT_ID]: "N/A",
          [ServerConstants.CHANNEL_NAME]: "General",
          [ServerConstants.STATUS]: DataStatusCodes.STATUS_ACTIVE,
          [ServerConstants.CHANNEL_TYPE]: ServerConstants.CHANNEL_VOICE,
        },
      ],
    };
  
    const categoryCollRef = collection(
      firestore,
      PathConstants.SERVER,
      serverId,
      PathConstants.CATEGORY
    );

    console.log(defaultMessageCategory);
    console.log(defaultVoiceCategory);
  
    await addDoc(categoryCollRef, defaultMessageCategory);
    await addDoc(categoryCollRef, defaultVoiceCategory);
  }

  module.exports = {
    addNewEmptyServer,
    addDefaultCategories
  }