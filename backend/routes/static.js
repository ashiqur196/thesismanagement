const express = require("express");
const {
  getProfileImage,
  getDocument,
} = require("../controllers/staticController/staticController");

const router = express.Router();

router.get("/profile-image/:filename", getProfileImage);
router.get("/document/:filename", getDocument);

module.exports = router;
