const { firestore } = require("../utils/firebaseSetup");
const {
  ServerConstants,
  PathConstants,
  DataStatusCodes,
  ProcessStatusCodes,
} = require("../utils/constants");
const {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
} = require("firebase/firestore");

const serverCollection = collection(firestore, PathConstants.SERVER);

async function getCategoryById(serverId, categoryId) {
  const docRef = doc(
    firestore,
    PathConstants.SERVER,
    serverId,
    PathConstants.CATEGORY,
    categoryId
  );
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return {
      statusCode: ProcessStatusCodes.NOT_FOUND,
      content: "Resource not found.",
    };
  }
  return {
    statusCode: ProcessStatusCodes.FOUND,
    content: docSnap,
  };
}

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

  await addDoc(categoryCollRef, defaultMessageCategory);
  await addDoc(categoryCollRef, defaultVoiceCategory);
}

async function addNewEmptyCategory(serverId, categoryName) {
  const collRef = collection(
    firestore,
    PathConstants.SERVER,
    serverId,
    PathConstants.CATEGORY
  );
  await addDoc(collRef, {
    [ServerConstants.CATEGORY_NAME]: categoryName,
    [ServerConstants.STATUS]: DataStatusCodes.STATUS_ACTIVE,
    [ServerConstants.CHANNEL_LIST]: [],
  });
}

async function deleteCategoryById(serverId, categoryId) {
  const result = await getCategoryById(serverId, categoryId);
  if (result.statusCode == ProcessStatusCodes.NOT_FOUND) {
    return {
      statusCode: result.statusCode,
      content: result.content,
    };
  }
  const docSnap = result.content;
  const docData = docSnap.data();
  const channelList = docData.channelList;
  const chatIdList = [];
  channelList.forEach((channel) => {
    if (channel.channelType == ServerConstants.CHANNEL_TEXT && channel.status == DataStatusCodes.STATUS_ACTIVE)
      chatIdList.push(channel.chatId);
  });

  await updateDoc(docSnap.ref, {
    [ServerConstants.STATUS]: DataStatusCodes.STATUS_DELETED,
    [ServerConstants.CHANNEL_LIST]: [],
  });
  return {
    statusCode: ProcessStatusCodes.SUCCESS,
    content: chatIdList,
  };
}

async function addNewChannel(
  serverId,
  categoryId,
  chatId,
  channelName,
  channelType
) {
  const result = await getCategoryById(serverId, categoryId);

  if (result.statusCode == ProcessStatusCodes.NOT_FOUND) {
    return ProcessStatusCodes.NOT_FOUND;
  }

  const docSnap = result.content;
  const docData = docSnap.data();
  const channelList = docData.channelList;
  const newChannel = {
    [ServerConstants.CHAT_ID]: chatId ?? new Date().getTime(),
    [ServerConstants.CHANNEL_NAME]: channelName,
    [ServerConstants.STATUS]: DataStatusCodes.STATUS_ACTIVE,
    [ServerConstants.CHANNEL_TYPE]: channelType,
  };
  channelList.push(newChannel);
  await updateDoc(docSnap.ref, {
    [ServerConstants.CHANNEL_LIST]: channelList,
  });
  return ProcessStatusCodes.SUCCESS;
}

async function deleteChannelByChatId(serverId, categoryId, chatId) {
  const result = await getCategoryById(serverId, categoryId);

  if (result.statusCode == ProcessStatusCodes.NOT_FOUND) {
    return {
      statusCode: ProcessStatusCodes.NOT_FOUND,
      content: "Category with provided ID does not exist.",
    };
  }

  const docSnap = result.content;
  const docData = docSnap.data();
  const channelList = docData.channelList;

  const idx = channelList.findIndex((obj) => obj.chatId == chatId);
  if (idx == -1) {
    return {
      statusCode: ProcessStatusCodes.NOT_FOUND,
      content: "Provided Chat ID does not exist within given category.",
    };
  }
  channelList[idx].status = DataStatusCodes.STATUS_DELETED;
  await updateDoc(docSnap.ref, {
    [ServerConstants.CHANNEL_LIST]: channelList,
  });
  return { statusCode: ProcessStatusCodes.SUCCESS, content: channelList[idx] };
}

module.exports = {
  addNewEmptyServer,
  addDefaultCategories,
  addNewEmptyCategory,
  deleteCategoryById,
  addNewChannel,
  deleteChannelByChatId,
};
