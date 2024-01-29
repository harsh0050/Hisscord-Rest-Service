const express = require("express");
const serverController = require("../controllers/serverController");
const router = express.Router();

router.post("/", serverController.createNewServer);
router.post("/category", serverController.createNewCategory);
router.delete("/category", serverController.deleteCategory);
router.post("/:categoryId/channel", serverController.createNewChannel);
router.delete("/:categoryId/channel", serverController.deleteChannel);

module.exports = router;