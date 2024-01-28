const { UserAuthConstants, PathConstants } = require("../utils/constants");
const { firestore } = require("../utils/firebaseSetup");

const {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  collection,
} = require("firebase/firestore");

const userCollection = collection(firestore, PathConstants.USER);

async function createUser(userId, username, email, phone) {
  const joinedAt = new Date().getTime();
  const user = {
    [UserAuthConstants.USER_ID]: userId,
    [UserAuthConstants.USERNAME]: username,
    [UserAuthConstants.EMAIL]: email,
    [UserAuthConstants.PHONE]: phone,
    [UserAuthConstants.JOINED_AT]: joinedAt,
    [UserAuthConstants.DM_LIST]: [],
    [UserAuthConstants.SERVER_LIST]: [],
    [UserAuthConstants.PROFILE_PICTURE]: [],
  };
  const docRef = doc(firestore, `${PathConstants.USER}/${userId}`);
  await setDoc(docRef, user);
}

async function getUserById(userId) {
  const docRef = doc(firestore, PathConstants.USER, userId);
  const docSnap = await getDoc(docRef);
  const user = docSnap.data();
  return user;
}

async function addDmToUsers(chatId, list) {
  await Promise.all(
    list.map(async (userId) => {
      const currDocRef = doc(firestore, PathConstants.USER, userId);
      const docSnap = await getDoc(currDocRef);
      const dmList = docSnap.data().dmList;
      dmList.push(chatId);
      return updateDoc(currDocRef, { dmList });
    })
  );
}

async function addServerIdToMembers(serverId, memberList) {
  const q = query(
    userCollection,
    where(UserAuthConstants.USER_ID, "in", memberList)
  );
  const querySnap = await getDocs(q);
  await Promise.all(
    querySnap.docs.map(async (docSnap) => {
      if (docSnap.exists()) {
        const docData = docSnap.data();
        const docServerList = docData.serverList;
        docServerList.push(serverId);
        return updateDoc(docSnap.ref, {
          [UserAuthConstants.SERVER_LIST]: docServerList,
        });
      }
    })
  );
}

module.exports = {
  createUser,
  getUserById,
  addDmToUsers,
  addServerIdToMembers
};
