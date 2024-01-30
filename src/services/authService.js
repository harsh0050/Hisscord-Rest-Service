const {
  UserAuthConstants,
  PathConstants,
  ProcessStatusCodes,
} = require("../utils/constants");
const { firestore } = require("../utils/firebaseSetup");
const bcrypt = require("bcrypt");

const {
  addDoc,
  collection,
  or,
  query,
  where,
  getDocs,
} = require("firebase/firestore");

const authCollection = collection(firestore, PathConstants.AUTHENTICATION);

async function addNewAuth(username, password, email, phone) {
  const hashedPassword = bcrypt.hashSync(password, 1);
  const auth = {
    [UserAuthConstants.USERNAME]: username,
    [UserAuthConstants.PASSWORD]: hashedPassword,
    [UserAuthConstants.EMAIL]: email,
    [UserAuthConstants.PHONE]: phone,
  };
  const docRef = await addDoc(authCollection, auth);

  const userId = docRef.id;
  return userId;
}

async function checkExistingUser(username, email, phone) {
  // const condition;

  const q = query(
    authCollection,
    or(
      where(
        UserAuthConstants.USERNAME,
        "==",
        username.length === 0 ? null : username
      ),
      where(UserAuthConstants.EMAIL, "==", email.length === 0 ? null : email),
      where(UserAuthConstants.PHONE, "==", phone.length === 0 ? null : phone)
    )
  );
  const docs = await getDocs(q);
  if (docs.docs.length == 0) {
    return {
      exists: false,
      message: "User doesn't exist.",
    };
  }
  const docData = docs.docs[0].data();
  const usernameExists =
    username.length === 0 ? false : docData.username == username;
  const emailExists = email.length === 0 ? false : docData.email == email;
  const phoneExists = phone.length === 0 ? false : docData.phone == phone;

  if (usernameExists && emailExists && phoneExists) {
    return {
      exists: true,
      message: "Username, Email address and Phone number are already in use.",
    };
  }
  if (!usernameExists) {
    if (emailExists && phoneExists) {
      return {
        exists: true,
        message: "Email address and Phone number are already in use.",
      };
    }
    if (emailExists) {
      return {
        exists: true,
        message: "Email address is already in use.",
      };
    }
    return {
      exists: true,
      message: "Phone number is already in use.",
    };
  }

  if (!emailExists) {
    if (phoneExists) {
      return {
        exists: true,
        message: "Username and Phone number are already in use.",
      };
    }
    return {
      exists: true,
      message: "Username is already in use.",
    };
  }
  return {
    exists: true,
    message: "Username and Email address are already in use.",
  };
}

async function getAuthByUsername(username) {
  const q = query(
    authCollection,
    where(UserAuthConstants.USERNAME, "==", username)
  );
  const docs = (await getDocs(q)).docs;
  if (docs.length == 0) {
    return {
      resultCode: ProcessStatusCodes.USERNAME_NOTEXISTS,
      content: "User with provided Email address does not exist.",
    };
  }
  const docSnap = docs[0];
  return {
    resultCode: ProcessStatusCodes.FOUND,
    content: docSnap,
  };
}

async function getAuthByEmail(email) {
  const q = query(authCollection, where(UserAuthConstants.EMAIL, "==", email));
  const docs = (await getDocs(q)).docs;
  if (docs.length == 0) {
    return {
      resultCode: ProcessStatusCodes.EMAIL_NOTEXISTS,
      content: "User with provided Email address does not exist.",
    };
  }
  const docSnap = docs[0];
  return {
    resultCode: ProcessStatusCodes.FOUND,
    content: docSnap,
  };
}

async function getAuthByPhone(phone) {
  const q = query(authCollection, where(UserAuthConstants.PHONE, "==", phone));
  const docs = (await getDocs(q)).docs;
  if (docs.length == 0) {
    return {
      statusCode: ProcessStatusCodes.PHONE_NOTEXISTS,
      content: "User with provided Phone number does not exist.",
    };
  }
  const docSnap = docs[0];
  return {
    resultCode: ProcessStatusCodes.FOUND,
    content: docSnap,
  };
}

module.exports = {
  addNewAuth,
  checkExistingUser,
  getAuthByUsername,
  getAuthByEmail,
  getAuthByPhone,
};
