const express = require("express");
const {
  createThesis,
  joinThesis,
  getMyThesis,
  getThesisbyId,
  editThesis,
  changeThesisPassword,
} = require("../controllers/thesisController/thesisController");
const checkAuth  = require("../middleware/basiccheck")
// const { checkAdmin } = require("../middleware/check-authentication")
const router = express.Router();

router.get("/mythesis", checkAuth, getMyThesis);
router.post("/create",checkAuth,createThesis);
router.post("/join", checkAuth, joinThesis);
router.get("/view/:thesisId", checkAuth, getThesisbyId);
router.put("/edit/:thesisId", checkAuth, editThesis);
router.put("/change-password/:thesisId", checkAuth, changeThesisPassword);
module.exports = router;