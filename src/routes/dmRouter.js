const express = require("express");
const router = express.Router();
const dmController = require("../controllers/dmController");

router.post("/", dmController.addNewDm);

module.exports = router;