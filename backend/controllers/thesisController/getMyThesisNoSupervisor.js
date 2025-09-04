const db = require("../../db/db");

async function getMyThesisNoSupervisor(req, res) {
  try {
    const status = "PENDING_SUPERVISOR";
    const userId = req.userData.userId;
    const userRole = req.userData.role;

    // Verify the user is a student
    if (userRole !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only students can access this resource.",
      });
    }

    // First, get the student record for the current user
    const student = await db.student.findUnique({
      where: {
        userId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student record not found for this user.",
      });
    }

    // Get theses where status is PENDING_SUPERVISOR and the current student is a member
    const theses = await db.thesis.findMany({
      where: {
        status: status,
        members: {
          some: {
            studentId: student.id,
          },
        },
      },
      select: {
        id: true,
        title: true,
        Code: true,
        status: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: {
        theses: theses,
      },
    });
  } catch (error) {
    console.error("Error fetching theses:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching theses",
      error: error.message,
    });
  }
}

module.exports = getMyThesisNoSupervisor;
