const express = require("express");
const {
  register,
  login,
} = require("../controllers/authController/authController");

// const { checkAdmin } = require("../middleware/check-authentication")
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
// router.post("/registeradmin",checkAdmin, registerAdmin);

module.exports = router;