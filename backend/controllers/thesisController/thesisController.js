const createThesis = require("./createThesis");
const deleteThesis = require("./deleteThesis");
const joinThesis = require("./joinThesis");
const getMyThesis = require("./getMyThesis");
const getThesisbyId = require("./getThesisbyId");
const editThesis = require("./editThesis");
const changeThesisPassword = require("./changeThesisPassword");
const removeThesisMember = require("./removeThesisMember");
const getThesisMembers = require("./getThesisMembers");
const updateThesisStatus = require("./updateThesisStatus");
const addThesisMember = require("./addThesisMember");
const getMyThesisNoSupervisor = require("./getMyThesisNoSupervisor");
const requestSupervisor = require("./requestSupervisor");
const getThesisbyIdPublic = require("./getThesisbyIdPublic");
const getThesisRequests = require("./getThesisRequests");
const updateSupervisionRequest = require("./updateSupervisionRequest");

// task management
const createTask = require("./createTask");
const editTask = require("./editTask");
const getTask = require("./getTask");
const deleteTask = require("./deleteTask");
const createSubmission = require("./createSubmission");
const provideFeedback = require("./provideFeedback");
const getTaskStats = require("./getTaskStats");

// appointment management
const getAppointments = require("./getAppointments");
const createAppointment = require("./createAppointment");
const updateAppointment = require("./updateAppointment");
const deleteAppointment = require("./deleteAppointment");

// ==============exports===============
module.exports.createThesis = createThesis;
module.exports.joinThesis = joinThesis;
module.exports.getMyThesis = getMyThesis;
module.exports.getThesisbyId = getThesisbyId;
module.exports.editThesis = editThesis;
module.exports.changeThesisPassword = changeThesisPassword;
module.exports.removeThesisMember = removeThesisMember;
module.exports.getThesisMembers = getThesisMembers;
module.exports.updateThesisStatus = updateThesisStatus;
module.exports.addThesisMember = addThesisMember;
module.exports.getMyThesisNoSupervisor = getMyThesisNoSupervisor;
module.exports.requestSupervisor = requestSupervisor;
module.exports.getThesisbyIdPublic = getThesisbyIdPublic;
module.exports.getThesisRequests = getThesisRequests;
module.exports.updateSupervisionRequest = updateSupervisionRequest;

// taskmanagement
module.exports.createTask = createTask;
module.exports.editTask = editTask;
module.exports.getTask = getTask;
module.exports.deleteTask = deleteTask;
module.exports.createSubmission = createSubmission;
module.exports.provideFeedback = provideFeedback;
module.exports.getTaskStats = getTaskStats;

// appointment management
module.exports.getAppointments = getAppointments;
module.exports.createAppointment = createAppointment;
module.exports.updateAppointment = updateAppointment;
module.exports.deleteAppointment = deleteAppointment;