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
    channelList = []
  ) {
    this.userId = userId;
    this.username = username;
    this.email = email;
    this.phone = phone;
    this.joinedAt = joinedAt;
    this.profilePicture = profilePicture;
    this.dmList = dmList;
    this.channelList = channelList;
  }

  static converter = {
    toFirestore: (user) => {
      return {
        userId: user.userId,
        username: user.username,
        email: user.email,
        phone: user.phone,
        dmList: user.dmList,
        channelList: user.channelList,
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
          data.channelList
        );
    },
  };
}

module.exports = User