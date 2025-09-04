const express = require("express");
const checkAuth  = require("../middleware/basiccheck")
const {
    getFaculty,
    getFacultyById,
    getRequests,
    getActiveTheses,
    getCompletedTheses
} = require("../controllers/facultyController/facultyController");

// const { checkAdmin } = require("../middleware/check-authentication")
const router = express.Router();

router.get("/", checkAuth, getFaculty);
router.get("/view/:id", checkAuth, getFacultyById);
router.get("/requests", checkAuth, getRequests);
router.get("/active-theses", checkAuth, getActiveTheses);
router.get("/completed-theses", checkAuth, getCompletedTheses);

module.exports = router;