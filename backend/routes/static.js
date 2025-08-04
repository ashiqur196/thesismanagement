const express = require("express");
const {
  getProfileImage,
} = require("../controllers/staticController/staticController");

const router = express.Router();

router.get("/profile-image/:filename", getProfileImage);

module.exports = router;
