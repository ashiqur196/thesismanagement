// controllers/appointmentController.js
const db = require("../../db/db");

async function getAppointments(req, res) {
  try {
    const { thesisId } = req.params;
    const userId = req.userData.userId;

    // Validate required fields
    if (!thesisId) {
      return res.status(400).json({
        success: false,
        message: "Thesis ID is required",
      });
    }

    // Check if user has access to this thesis
    const userThesisAccess = await checkThesisAccess(userId, parseInt(thesisId));
    if (!userThesisAccess.hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this thesis",
      });
    }

    // Get appointments with faculty data
    const appointments = await db.appointment.findMany({
      where: {
        thesisId: parseInt(thesisId),
      },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
        thesis: {
          select: {
            id: true,
            title: true,
            Code: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching appointments",
      error: error.message,
    });
  }
}

// Helper function to check if user has access to the thesis
async function checkThesisAccess(userId, thesisId) {
  try {
    // Check if user is faculty
    const faculty = await db.faculty.findFirst({
      where: { userId: userId },
      include: {
        supervisedTheses: {
          where: { id: thesisId },
        },
      },
    });

    if (faculty && faculty.supervisedTheses.length > 0) {
      return { hasAccess: true, role: 'FACULTY' };
    }

    // Check if user is a student member of the thesis
    const student = await db.student.findFirst({
      where: { userId: userId },
      include: {
        ThesisMember: {
          where: { thesisId: thesisId },
        },
      },
    });

    if (student && student.ThesisMember.length > 0) {
      return { hasAccess: true, role: 'STUDENT' };
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user && user.role === 'ADMIN') {
      return { hasAccess: true, role: 'ADMIN' };
    }

    return { hasAccess: false, role: null };
  } catch (error) {
    console.error("Error checking thesis access:", error);
    return { hasAccess: false, role: null };
  }
}

module.exports = getAppointments;
