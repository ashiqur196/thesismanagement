const db = require("../../db/db");

async function getThesisbyId(req, res) {
  try {
    const { thesisId } = req.params;
    const userId = req.userData.userId;
    const userRole = req.userData.role;

    // Validate thesisId parameter
    if (!thesisId || isNaN(parseInt(thesisId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid thesis ID"
      });
    }

    const thesisIdInt = parseInt(thesisId);

    // Check if user has access to this thesis
    let hasAccess = false;

    if (userRole === 'STUDENT') {
      // Check if student is a member of this thesis
      const studentMembership = await db.thesisMember.findFirst({
        where: {
          thesisId: thesisIdInt,
          student: {
            userId: userId
          }
        }
      });
      hasAccess = !!studentMembership;
    } else if (userRole === 'FACULTY') {
      // Check if faculty is supervisor of this thesis using supervisorId
      const faculty = await db.faculty.findUnique({
        where: { userId: userId },
        select: { id: true }
      });

      if (faculty) {
        const thesis = await db.thesis.findUnique({
          where: { id: thesisIdInt },
          select: { supervisorId: true }
        });
        
        // Faculty has access if they are the supervisor
        hasAccess = thesis && thesis.supervisorId === faculty.id;
      }
    } else if (userRole === 'ADMIN') {
      // Admin has access to all theses
      hasAccess = true;
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this thesis"
      });
    }

    // Get the thesis with all related data
    const thesis = await db.thesis.findUnique({
      where: {
        id: thesisIdInt
      },

    });

    if (!thesis) {
      return res.status(404).json({
        success: false,
        message: "Thesis not found"
      });
    }

    res.json({
      success: true,
      thesis: thesis
    });

  } catch (error) {
    console.error("Error fetching thesis:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching thesis",
      error: error.message
    });
  }
}

module.exports = getThesisbyId;