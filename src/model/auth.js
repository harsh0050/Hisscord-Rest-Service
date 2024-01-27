const { DocumentSnapshot, SnapshotOptions } = require("firebase/firestore");

class Auth {
  constructor(username, password, email, phone) {
    this.username = username;
    this.password = password;
    this.email = email;
    this.phone = phone;
  }

  static authConverter = {
    toFirestore: (auth) => {
      return {
        username: auth.username,
        password: auth.password,
        email: auth.email,
        phone: auth.phone,
      };
    },
    fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      if (data) {
        return new Auth(data.username, data.password, data.email, data.phone);
      } else {
        return undefined;
      }
    },
  };
}

module.exports = Auth