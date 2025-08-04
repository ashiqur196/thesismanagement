const express = require("express");
const checkAuth  = require("../middleware/basiccheck")
const { uploadProfileImage} = require("../config/multer-config");
const {
getProfile,
updateProfile,
} = require("../controllers/profileController/profileController");

// const { checkAdmin } = require("../middleware/check-authentication")
const router = express.Router();

router.get("/profile", checkAuth, getProfile);
router.put("/profile", checkAuth, uploadProfileImage, updateProfile);

module.exports = router;