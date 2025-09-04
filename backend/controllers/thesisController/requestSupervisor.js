// controllers/supervisorController/requestSupervisor.js
const db = require("../../db/db");

async function requestSupervisor(req, res) {
  try {
    const { thesisId, facultyId, message } = req.body;
    const studentId = req.userData.userId;

    // Validate required fields
    if (!thesisId || !facultyId) {
      return res.status(400).json({
        success: false,
        message: "Thesis ID and Faculty ID are required"
      });
    }

    // Convert IDs to integers
    const thesisIdInt = parseInt(thesisId);
    const facultyIdInt = parseInt(facultyId);

    if (isNaN(thesisIdInt) || isNaN(facultyIdInt)) {
      return res.status(400).json({
        success: false,
        message: "Invalid thesis or faculty ID"
      });
    }

    // Check if user is a student
    if (req.userData.role !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message: "Only students can request supervisors"
      });
    }

    // Get student record
    const student = await db.student.findUnique({
      where: { userId: studentId },
      select: { id: true }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student record not found"
      });
    }

    // Check if thesis exists and belongs to the student
    const thesis = await db.thesis.findFirst({
      where: {
        id: thesisIdInt,
        members: {
          some: {
            studentId: student.id
          }
        }
      },
      include: {
        supervisor: true
      }
    });

    if (!thesis) {
      return res.status(404).json({
        success: false,
        message: "Thesis not found or you don't have access to it"
      });
    }

    // Check if thesis already has a supervisor
    if (thesis.supervisorId) {
      return res.status(400).json({
        success: false,
        message: "This thesis already has a supervisor"
      });
    }

    // Check if thesis status is PENDING_SUPERVISOR
    if (thesis.status !== "PENDING_SUPERVISOR") {
      return res.status(400).json({
        success: false,
        message: "Thesis is not in PENDING_SUPERVISOR status"
      });
    }

    // Check if faculty exists
    const faculty = await db.faculty.findUnique({
      where: { id: facultyIdInt }
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty member not found"
      });
    }

    // Check if there's already a pending request for this thesis and faculty
    const existingRequest = await db.supervisorRequest.findFirst({
      where: {
        thesisId: thesisIdInt,
        facultyId: facultyIdInt,
        status: "PENDING"
      }
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "A pending request already exists for this thesis and faculty"
      });
    }

    // Create the supervisor request
    const supervisorRequest = await db.supervisorRequest.create({
      data: {
        thesisId: thesisIdInt,
        facultyId: facultyIdInt,
        studentId: student.id,
        message: message || null,
        status: "PENDING"
      },
      include: {
        thesis: {
          select: {
            title: true,
            Code: true
          }
        },
        faculty: {
          select: {
            name: true,
            department: true
          }
        },
        student: {
          select: {
            name: true,
            department: true
          }
        }
      }
    });

    // Create notification for the faculty
    await db.notification.create({
      data: {
        userId: faculty.userId,
        facultyId: facultyIdInt,
        thesisId: thesisIdInt,
        type: "SUPERVISOR_REQUEST",
        title: "New Supervisor Request",
        message: `Student ${supervisorRequest.student.name} has requested you to supervise their thesis "${supervisorRequest.thesis.title}"`,
        relatedId: supervisorRequest.id
      }
    });

    res.status(201).json({
      success: true,
      message: "Supervisor request sent successfully",
    });

  } catch (error) {
    console.error("Error creating supervisor request:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating supervisor request",
      error: error.message
    });
  }
}

module.exports = requestSupervisor;