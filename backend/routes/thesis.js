const express = require("express");
const {
  createThesis,
  joinThesis,
  getMyThesis,
  getThesisbyId,
  editThesis,
  changeThesisPassword,
  removeThesisMember,
  getThesisMembers,
  updateThesisStatus,
  addThesisMember,
  getMyThesisNoSupervisor,
  requestSupervisor,
  getThesisbyIdPublic,
  getThesisRequests,
  updateSupervisionRequest,
  createTask,
  getTask,
  deleteTask,
  createSubmission,
  provideFeedback,
  editTask,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointments,
  getTaskStats
} = require("../controllers/thesisController/thesisController");
const checkAuth = require("../middleware/basiccheck");
const { uploadDocument } = require('../config/multer-config');
const deleteThesis = require("../controllers/thesisController/deleteThesis");
const router = express.Router();


router.get("/mythesis", checkAuth, getMyThesis);
router.delete("/delete/:thesisId", checkAuth, deleteThesis);
router.get("/mythesis/nosupervisor", checkAuth, getMyThesisNoSupervisor);
router.post("/create", checkAuth, createThesis);
router.post("/join", checkAuth, joinThesis);
router.get("/view/:thesisId", checkAuth, getThesisbyId);
router.get("/view-public/:thesisId", checkAuth, getThesisbyIdPublic);
router.put("/edit/:thesisId", checkAuth, editThesis);
router.put("/change-password/:thesisId", checkAuth, changeThesisPassword);
router.post("/remove-member", checkAuth, removeThesisMember); //{post request contains email, thesisId}
router.get("/members/:thesisId", checkAuth, getThesisMembers); 
router.put("/update-status/:thesisId", checkAuth, updateThesisStatus); 
router.post("/add-member/:thesisId", checkAuth, addThesisMember); //{post request contains email }
router.post("/request-supervisor", checkAuth, requestSupervisor);
router.get("/supervisor-requests/:thesisId", checkAuth, getThesisRequests);
router.patch("/update-supervisor-request/:requestId", checkAuth, updateSupervisionRequest);

// task and submission
router.post('/tasks', checkAuth, createTask);
router.put("/tasks/:taskId", checkAuth, editTask);
router.get('/tasks/:thesisId', checkAuth, getTask);
router.delete('/tasks/:taskId', checkAuth, deleteTask);
router.post('/submissions', checkAuth, uploadDocument, createSubmission);
router.put('/submissions/feedback/:submissionId', checkAuth, provideFeedback);
router.get("/task-stats/:thesisId", checkAuth, getTaskStats);

// appointment management
router.get('/appointments/:thesisId', checkAuth, getAppointments);
router.post('/appointment', checkAuth, createAppointment);
router.put('/appointment/:appointmentId', checkAuth, updateAppointment);
router.delete('/appointment/:appointmentId', checkAuth, deleteAppointment);


module.exports = router;