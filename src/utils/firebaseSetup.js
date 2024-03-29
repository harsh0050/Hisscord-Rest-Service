const { initializeApp } = require("firebase/app");
const { getAnalytics } = require("firebase/analytics");
const Firestore = require("firebase/firestore");

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

async function clearDatabase() {
  (
    await Firestore.getDocs(Firestore.collection(firestore, "authentication"))
  ).docs.forEach((docSnap) => {
    Firestore.deleteDoc(docSnap.ref);
  });
  (
    await Firestore.getDocs(Firestore.collection(firestore, "user"))
  ).docs.forEach((docSnap) => {
    Firestore.deleteDoc(docSnap.ref);
  });
  (
    await Firestore.getDocs(Firestore.collection(firestore, "chat"))
  ).docs.forEach(async (docSnap) => {
    console.log("noew: ", docSnap.id);
    (
      await Firestore.getDocs(
        Firestore.collection(firestore, "chat", docSnap.id, "message")
      )
    ).docs.forEach(async (subDocSnap) => {
      await Firestore.deleteDoc(subDocSnap.ref);
    });
    Firestore.deleteDoc(docSnap.ref);
  });

  (
    await Firestore.getDocs(Firestore.collection(firestore, "direct-messages"))
  ).docs.forEach((docSnap) => {
    Firestore.deleteDoc(docSnap.ref);
  });

  (
    await Firestore.getDocs(Firestore.collection(firestore, "server"))
  ).docs.forEach(async (docSnap) => {
    (
      await Firestore.getDocs(
        Firestore.collection(firestore, "server", docSnap.id, "category")
      )
    ).docs.forEach(async (nDocSnap) => {
      await Firestore.deleteDoc(nDocSnap.ref);
    });
    Firestore.deleteDoc(docSnap.ref);
  });
}
module.exports = { firestore, clearDatabase };
