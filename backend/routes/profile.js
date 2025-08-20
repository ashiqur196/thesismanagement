const express = require("express");
const checkAuth  = require("../middleware/basiccheck")
const { uploadProfileImage} = require("../config/multer-config");
const {
getProfile,
updateProfile,
updatePassword,
getContributions,
addContribution,
updateContribution,
deleteContribution,
} = require("../controllers/profileController/profileController");

// const { checkAdmin } = require("../middleware/check-authentication")
const router = express.Router();

router.get("/profile", checkAuth, getProfile);
router.get("/contributions", checkAuth, getContributions);
router.post("/contributions", checkAuth, addContribution);
router.put("/contributions",checkAuth,updateContribution);
router.delete("/contributions", checkAuth, deleteContribution);
router.put("/profile", checkAuth, uploadProfileImage, updateProfile);
router.put("/profile/password", checkAuth, updatePassword);

module.exports = router;