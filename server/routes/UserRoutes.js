const express = require("express");
const router = express.Router();

const { signup, login, userImageUpload, deleteUserImage } = require("../controllers/UserController");

router.post("/imageUpload", userImageUpload);
router.post("/sigup", signup);
router.post("/login", login);
router.post("/deleteImage", deleteUserImage);

module.exports = router;