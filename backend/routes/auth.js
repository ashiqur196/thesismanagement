const express = require("express");
const {
  register,
  login,
  checkToken
} = require("../controllers/authController/authController");

// const { checkAdmin } = require("../middleware/check-authentication")
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/checktoken", checkToken);


module.exports = router;