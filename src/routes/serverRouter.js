const express = require("express");
const serverController = require("../controllers/serverController");
const router = express.Router();

router.post("/", serverController.createNewServer);

module.exports = router;