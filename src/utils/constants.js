class PathConstants {
  static AUTHENTICATION = "authentication";
  static USER = "user";
  static DIRECT_MESSAGE = "direct-messages";
  static SERVER = "server";
  static CHAT = "chat";
  static CATEGORY = "category";
  static MESSAGE = "message";
}

class DataStatusCodes {
  static STATUS_ACTIVE = 100;
  static STATUS_NEW = 101;
  static STATUS_EDITED = 102;
  static STATUS_DELETED = 104;
}

class ProcessStatusCodes {
  static SUCCESS = 200;
  static FOUND = 201;
  static USERNAME_NOTEXISTS = 202;
  static EMAIL_NOTEXISTS = 203;
  static PHONE_NOTEXISTS = 204;
  static INCORRECT_PASSWORD = 205;
  static NOT_FOUND = 206;
}

class ResponseCodes {
  static SUCCESS = 200;
  static BAD_REQUEST = 400;
  static UNAUTHORIZED = 401;
  static NOT_FOUND = 404;
  static CONFLICT = 409;
  static INTERNAL_SERVER_ERROR = 500;
}
class Strings {
  static INTERNAL_SERVER_ERROR = "The server encountered an unexpected error.";
  static BAD_REQUEST = "Incomplete data provided.";
}

class UserAuthConstants {
  static USER_ID = "userId";
  static USERNAME = "username";
  static EMAIL = "email";
  static PHONE = "phone";
  static PASSWORD = "password";
  static JOINED_AT = "joinedAt";
  static PROFILE_PICTURE = "profilePicture";
  static DM_LIST = "dmList";
  static SERVER_LIST = "serverList";
}

class DmConstants {
  static CREATED_AT = "createdAt";
  static MEMBER_LIST = "memberList";
  static CHAT_ID = "chatId";
}

class ServerConstants {
  static SERVER_NAME = "serverName";
  static ADMIN_USER_ID = "adminUserId";
  static CREATED_AT = "createdAt";
  static MEMBER_LIST = "memberList";
  static CATEGORY_NAME = "categoryName";
  static CHANNEL_NAME = "channelName";
  static CHANNEL_TYPE = "channelType";
  static CHANNEL_LIST = "channelList";
  static CHANNEL_VOICE = 600;
  static CHANNEL_TEXT = 601;
  static STATUS = "status";
  static CHAT_ID = "chatId";
  static ROOT_CATEGORY = "root";
}

class ChatConstants {
  static CHAT_ID = "chatId";
  static MESSAGE_ID = "messageId";
  static MIME_TYPE = "mimeType";
  static STATUS = "status";
  static SENT_BY = "sentBy";
  static NOT_SEEN_BY = "notSeenBy";
  static CONTENT = "content";
  static TEXT = "text";
  static IMAGE = "image";
  static MIME_TEXT = 55;
  static MIME_IMAGE = 56;
  static TIMESTAMP = "timestamp";
}

module.exports = {
  PathConstants,
  DataStatusCodes,
  ProcessStatusCodes,
  ResponseCodes,
  Strings,
  UserAuthConstants,
  DmConstants,
  ServerConstants,
  ChatConstants,
};
