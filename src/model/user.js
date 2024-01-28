const { DocumentSnapshot, SnapshotOptions } = require("firebase/firestore");

class User {
  constructor(
    userId,
    username,
    email,
    phone,
    joinedAt,
    profilePicture = [],
    dmList = [],
    serverList = []
  ) {
    this.userId = userId;
    this.username = username;
    this.email = email;
    this.phone = phone;
    this.joinedAt = joinedAt;
    this.profilePicture = profilePicture;
    this.dmList = dmList;
    this.serverList = serverList;
  }

  static converter = {
    toFirestore: (user) => {
      return {
        userId: user.userId,
        username: user.username,
        email: user.email,
        phone: user.phone,
        dmList: user.dmList,
        serverList: user.serverList,
        joinedAt: user.joinedAt,
        profilePicture: user.profilePicture,
      };
    },
    fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
        return new User(
          data.userId,
          data.username,
          data.email,
          data.phone,
          data.joinedAt,
          data.profilePicture,
          data.dmList,
          data.serverList
        );
    },
  };
}

module.exports = User