const {
  addNewAuth,
  checkExistingUser,
  getAuthByUsername,
  getAuthByEmail,
  getAuthByPhone,
} = require("../services/authService");

const {
  createUser,
  getUserById,
} = require("../services/userService");

const {
  ResponseCodes,
  Strings,
  ProcessStatusCodes,
} = require("../utils/constants");

const {
  getErrorJson
} = require("../utils/responseUtils")

const bcrypt = require("bcrypt");

const authController = {
  async register(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const phone = req.body.phone;

    if (username==undefined || !password || email==undefined || phone==undefined) {
      res.status(ResponseCodes.BAD_REQUEST).json(getErrorJson(Strings.BAD_REQUEST));
      return;
    }

    try {
      const result = await checkExistingUser(username, email, phone);
      if (result.exists) {
        res.status(ResponseCodes.CONFLICT).json(getErrorJson(result.message));
        return;
      }
      const userId = await addNewAuth(username, password, email, phone);
      await createUser(userId, username, email, phone);
      const user = await getUserById(userId);

      if (user == undefined) {
        res
          .status(ResponseCodes.CONFLICT)
          .json(
            getErrorJson("An error occured while creating the user, Internal server error.")
          );
        return;
      }

      res.status(ResponseCodes.SUCCESS).send(user);
    } catch (err) {
      console.log(err);
      res
        .status(ResponseCodes.INTERNAL_SERVER_ERROR)
        .json(getErrorJson(Strings.INTERNAL_SERVER_ERROR));
    }
  },

  async login(req, res) {
    const username = req.body.username;
    const email = req.body.email;
    const phone = req.body.phone;

    const password = req.body.password;

    if (!password || !(username || email || phone)) {
      res.status(ResponseCodes.BAD_REQUEST).json(getErrorJson(Strings.BAD_REQUEST));
      return;
    }

    try {
      let getAuthResult;
      if (username) {
        getAuthResult = await getAuthByUsername(username);
      } else if (email) {
        getAuthResult = await getAuthByEmail(email);
      } else {
        getAuthResult = await getAuthByPhone(phone);
      }

      if (getAuthResult.resultCode != ProcessStatusCodes.FOUND) {
        res.status(ResponseCodes.NOT_FOUND).json(getErrorJson(getAuthResult.content));
        return;
      }
      authSnap = getAuthResult.content;

      if (!bcrypt.compareSync(password, authSnap.data().password)) {
        res.status(ResponseCodes.UNAUTHORIZED).json(getErrorJson("Incorrect password."));
        return;
      }

      const userId = authSnap.id;
      const user = await getUserById(userId);
      res.status(ResponseCodes.SUCCESS).send(user);
    } catch (err) {
      console.log(err);
      res
        .status(ResponseCodes.INTERNAL_SERVER_ERROR)
        .json(getErrorJson(Strings.INTERNAL_SERVER_ERROR));
    }
  },
};

module.exports = authController;
