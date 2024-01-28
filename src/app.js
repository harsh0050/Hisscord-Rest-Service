const { initializeApp } = require("firebase/app");
const { getAnalytics } = require("firebase/analytics");
const Firestore = require("firebase/firestore");
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const Auth = require("./model/auth");
const User = require("./model/user");
const {
  PathConstants,
  DataProcessCodes,
  ProcessStatusCodes,
  ResponseCodes,
  Strings,
  UserAuthConstants,
  DmConstants,
  ServerConstants,
  ChatConstants,
  DataStatusCodes,
} = require("./utils/constants");

const app = express();
const PORT = process.env.PORT || 8000;

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
// const analytics = getAnalytics(firebaseApp);

const firestore = Firestore.getFirestore(firebaseApp);

const authCollection = Firestore.collection(
  firestore,
  PathConstants.AUTHENTICATION
);
const userCollection = Firestore.collection(firestore, PathConstants.USER);
const dmCollection = Firestore.collection(
  firestore,
  PathConstants.DIRECT_MESSAGE
);
const serverCollection = Firestore.collection(firestore, PathConstants.SERVER);
const chatCollection = Firestore.collection(firestore, PathConstants.CHAT);

//Body parser Middleware
app.use((req, res, next) => {
  const contentType = req.headers["content-type"];
  if (contentType === "application/x-www-form-urlencoded") {
    bodyParser.urlencoded({ extended: true })(req, res, next);
    return;
  }
  if (contentType === "application/json") {
    bodyParser.json()(req, res, next);
    return;
  }
  res
    .status(ResponseCodes.BAD_REQUEST)
    .send("Empty or Incorrect request body.");
});

//====================================================================================================

//Registration:
app.post("/auth/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const phone = req.body.phone;
  if (!(username && password && email && phone)) {
    res.status(ResponseCodes.BAD_REQUEST).send(Strings.BAD_REQUEST);
    return;
  }

  try {
    const existance = await checkExistingAccount(username, email, phone);

    if (existance != false) {
      res.status(ResponseCodes.CONFLICT).send(existance);
      return;
    }
    bcrypt.genSaltSync(1);
    const hashedPassword = bcrypt.hashSync(password, 1);
    const user = await register(
      new Auth(username, hashedPassword, email, phone)
    );
    res.send(user);
  } catch (err) {
    console.log(err);
    res
      .status(ResponseCodes.INTERNAL_SERVER_ERROR)
      .send(Strings.INTERNAL_SERVER_ERROR);
  }
});

async function register(auth) {
  const docRef = await Firestore.addDoc(
    authCollection,
    Auth.authConverter.toFirestore(auth)
  );

  const userId = docRef.id;
  console.log(auth.username);
  return await createUser(userId, auth.username, auth.email, auth.phone);
}

async function createUser(userId, username, email, phone) {
  const joinedAt = new Date().getTime();
  const user = new User(userId, username, email, phone, joinedAt);
  console.log(user);
  await Firestore.setDoc(
    Firestore.doc(firestore, `${PathConstants.USER}/${userId}`),
    User.converter.toFirestore(user)
  );
  return user;
}

async function checkExistingAccount(username, email, phone) {
  const query = Firestore.query(
    authCollection,
    Firestore.or(
      Firestore.where(UserAuthConstants.USERNAME, "==", username),
      Firestore.where(UserAuthConstants.EMAIL, "==", email),
      Firestore.where(UserAuthConstants.PHONE, "==", phone)
    )
  );
  const docs = await Firestore.getDocs(query);
  if (docs.docs.length == 0) {
    return false;
  }
  const docData = docs.docs[0].data();
  const usernameExists = docData.username == username;
  const emailExists = docData.email == email;
  const phoneExists = docData.phone == phone;

  if (usernameExists && emailExists && phoneExists) {
    return "Username, Email address and Phone number are already in use.";
  }
  if (!usernameExists) {
    if (emailExists && phoneExists) {
      return "Email address and Phone number are already in use.";
    }
    if (emailExists) {
      return "Email address is already in use.";
    }
    return "Phone number is already in use.";
  }

  if (!emailExists) {
    if (phoneExists) {
      return "Username and Phone number are already in use.";
    }
    return "Username is already in use.";
  }
  return "Username and Email address are already in use.";
}

//=======================================================================================================

//Login:
app.post("/auth/login", async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const phone = req.body.phone;

  const password = req.body.password;

  if (!password || !(username || email || phone)) {
    res.status(ResponseCodes.BAD_REQUEST).send(Strings.BAD_REQUEST);
    return;
  }

  try {
    if (username) {
      const result = await loginWithUsername(username, password);
      if (result.statusCode == ProcessStatusCodes.SUCCESS) {
        res.send(result.content);
        return;
      }
      if (result.statusCode == ProcessStatusCodes.USERNAME_NOTEXISTS) {
        res.status(ResponseCodes.NOT_FOUND).send(result.content);
        return;
      }
      res.status(ResponseCodes.UNAUTHORIZED).send(result.content);
      return;
    }
    if (email) {
      const result = await loginWithEmail(email, password);
      if (result.statusCode == ProcessStatusCodes.SUCCESS) {
        console.log("success");
        res.send(result.content);
        return;
      }
      if (result.statusCode == ProcessStatusCodes.EMAIL_NOTEXISTS) {
        console.log("not exists");
        res.status(ResponseCodes.NOT_FOUND).send(result.content);
        return;
      }
      res.status(ResponseCodes.UNAUTHORIZED).send(result.content);
      return;
    }

    const result = await loginWithPhone(phone, password);
    if (result.statusCode == ProcessStatusCodes.SUCCESS) {
      res.send(result.content);
      return;
    }
    if (result.statusCode == ProcessStatusCodes.USERNAME_NOTEXISTS) {
      res.status(ResponseCodes.NOT_FOUND).send(result.content);
      return;
    }
    res.status(ResponseCodes.UNAUTHORIZED).send(result.content);
  } catch (err) {
    console.log(err);
    res
      .status(ResponseCodes.INTERNAL_SERVER_ERROR)
      .send(Strings.INTERNAL_SERVER_ERROR);
  }
});

async function loginWithUsername(username, password) {
  const query = Firestore.query(
    authCollection,
    Firestore.where(UserAuthConstants.USERNAME, "==", username)
  );
  const docs = (await Firestore.getDocs(query)).docs;
  if (docs.length == 0) {
    return {
      statusCode: ProcessStatusCodes.USERNAME_NOTEXISTS,
      content: "User with provided Email address does not exist.",
    };
  }
  const docSnap = docs[0];

  if (!bcrypt.compareSync(password, docSnap.data().password)) {
    return {
      statusCode: ProcessStatusCodes.INCORRECT_PASSWORD,
      content: "Incorrect password.",
    };
  }

  const userId = docSnap.id;
  return {
    statusCode: ProcessStatusCodes.SUCCESS,
    content: await getUserById(userId),
  };
}

async function loginWithEmail(email, password) {
  const query = Firestore.query(
    authCollection,
    Firestore.where(UserAuthConstants.EMAIL, "==", email)
  );
  const docs = (await Firestore.getDocs(query)).docs;
  if (docs.length == 0) {
    return {
      statusCode: ProcessStatusCodes.EMAIL_NOTEXISTS,
      content: "User with provided Email address does not exist.",
    };
  }
  const docSnap = docs[0];

  if (!bcrypt.compareSync(password, docSnap.data().password)) {
    return {
      statusCode: ProcessStatusCodes.INCORRECT_PASSWORD,
      content: "Incorrect password.",
    };
  }

  const userId = docSnap.id;
  return {
    statusCode: ProcessStatusCodes.SUCCESS,
    content: await getUserById(userId),
  };
}

async function loginWithPhone(phone, password) {
  const query = Firestore.query(
    authCollection,
    Firestore.where(UserAuthConstants.PHONE, "==", phone)
  );
  const docs = (await Firestore.getDocs(query)).docs;
  if (docs.length == 0) {
    return {
      statusCode: ProcessStatusCodes.PHONE_NOTEXISTS,
      content: "User with provided Phone number does not exist.",
    };
  }
  const docSnap = docs[0];

  if (!bcrypt.compareSync(password, docSnap.data().password)) {
    return {
      statusCode: ProcessStatusCodes.INCORRECT_PASSWORD,
      content: "Incorrect password.",
    };
  }

  const userId = docSnap.id;
  return {
    statusCode: ProcessStatusCodes.SUCCESS,
    content: await getUserById(userId),
  };
}

async function getUserById(userId) {
  const docRef = Firestore.doc(
    firestore,
    PathConstants.USER,
    userId
  ).withConverter(User.converter);
  const doc = await Firestore.getDoc(docRef);
  const user = doc.data();
  return user;
}
//========================================================================================================

//Direct Messages:
app.post("/dm", async (req, res) => {
  const memberList = req.body.memberList;
  if (!memberList) {
    res.status(ResponseCodes.BAD_REQUEST).send(Strings.BAD_REQUEST);
    return;
  }
  try {
    const docRef = await Firestore.addDoc(dmCollection, {
      memberList,
      createdAt: new Date().getTime(),
    });

    const chatId = docRef.id;

    await Promise.all(
      memberList.map(async (userId) => {
        const currDocRef = Firestore.doc(firestore, PathConstants.USER, userId);
        const doc = await Firestore.getDoc(currDocRef);
        const dmList = doc.data().dmList;
        dmList.push(chatId);
        return Firestore.updateDoc(currDocRef, { dmList });
      })
    );

    await addNewEmptyChatWithChatId(chatId);
    res.status(ResponseCodes.SUCCESS).end();
  } catch (err) {
    console.log(err);
    res
      .status(ResponseCodes.INTERNAL_SERVER_ERROR)
      .send(Strings.INTERNAL_SERVER_ERROR);
  }
});

//========================================================================================================

//Server:
app.post("/server", async (req, res) => {
  const serverName = req.body.serverName;
  const adminUserId = req.body.adminUserId;
  const memberList = req.body.memberList ?? [adminUserId];
  if (!serverName || !adminUserId) {
    res.status(ResponseCodes.BAD_REQUEST).send(Strings.BAD_REQUEST);
    return;
  }
  try{
    const serverId = await addnewEmptyServer(serverName, adminUserId, memberList);
    await addDefaultCategories(serverId);
    await addServerIdToMembers(serverId, memberList);
    res.status(ResponseCodes.SUCCESS).end();
  }catch(err){
    console.log(err);
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).send(Strings.INTERNAL_SERVER_ERROR);
  }
});

async function addServerIdToMembers(serverId, memberList) {
  const query = Firestore.query(
    userCollection,
    Firestore.where(UserAuthConstants.USER_ID, "in", memberList)
  );
  const querySnap = await Firestore.getDocs(query);
  await Promise.all(
    querySnap.docs.map(async (docSnap) => {
      if (docSnap.exists()) {
        const docData = docSnap.data();
        const docServerList = docData.serverList;
        docServerList.push(serverId);
        return Firestore.updateDoc(docSnap.ref, {
          [UserAuthConstants.SERVER_LIST]: docServerList,
        });
      }
    })
  );
}

async function addnewEmptyServer(serverName, adminUserId, memberList) {
  const data = {
    [ServerConstants.SERVER_NAME]: serverName,
    [ServerConstants.ADMIN_USER_ID]: adminUserId,
    [ServerConstants.MEMBER_LIST]: memberList,
    [ServerConstants.CREATED_AT]: new Date().getTime(),
  };
  const docRef = await Firestore.addDoc(serverCollection, data);
  const serverId = docRef.id;
  return serverId;
}

async function addDefaultCategories(serverId) {
  const defaultMessageCategory = {
    [ServerConstants.CATEGORY_NAME]: "TEXT CHANNELS",
    [ServerConstants.CHANNEL_LIST]: [
      {
        [ServerConstants.CHAT_ID]: await addNewEmptyChat(),
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

  const categoryCollRef = Firestore.collection(
    firestore,
    PathConstants.SERVER,
    serverId,
    PathConstants.CATEGORY
  );

  await Firestore.addDoc(categoryCollRef, defaultMessageCategory);
  await Firestore.addDoc(categoryCollRef, defaultVoiceCategory);
}

async function addNewEmptyChat() {
  const docRef = await Firestore.addDoc(chatCollection, {});
  return docRef.id;
}

//========================================================================================================

//Chat:
app.post("/chat", async (req, res) => {
  const chatId = req.body.chatId;
  if (!chatId) {
    res.status(ResponseCodes.BAD_REQUEST).send("Chat ID not provided.");
    return;
  }
  try {
    await addNewEmptyChatWithChatId(chatId);
    res.status(ResponseCodes.SUCCESS).end();
  } catch (err) {
    console.log(err);
    res
      .status(ResponseCodes.INTERNAL_SERVER_ERROR)
      .send(Strings.INTERNAL_SERVER_ERROR);
  }
});

app.delete("/chat", async (req, res) => {
  const chatId = req.body.chatId;
  if (!chatId) {
    res.status(ResponseCodes.BAD_REQUEST).send("Chat ID not provided.");
    return;
  }
  try {
    await deleteChat(chatId);
    res.status(ResponseCodes.SUCCESS).end();
  } catch (err) {
    console.log(err);
    res
      .status(ResponseCodes.INTERNAL_SERVER_ERROR)
      .send(Strings.INTERNAL_SERVER_ERROR);
  }
});

async function addNewEmptyChatWithChatId(chatId) {
  const docRef = Firestore.doc(firestore, PathConstants.CHAT, chatId);
  await Firestore.setDoc(docRef, {});
}

async function deleteChat(chatId) {
  const collRef = Firestore.collection(
    firestore,
    PathConstants.CHAT,
    chatId,
    PathConstants.MESSAGE
  );
  const querySnap = await Firestore.getDocs(collRef);
  await Promise.all(
    querySnap.docs.map(async (docSnap) => {
      return Firestore.deleteDoc(docSnap);
    })
  );
  await Firestore.deleteDoc(
    Firestore.doc(firestore, PathConstants.CHAT, chatId)
  );
}

app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
