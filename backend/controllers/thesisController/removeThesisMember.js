const db = require("../../db/db");

async function removeThesisMember(req, res) {
  try {
    const { email, thesisId } = req.body;
    const userId = req.userData.userId;
    const userRole = req.userData.role;

    // Validate required fields
    if (!email || !thesisId) {
      return res.status(400).json({
        success: false,
        message: "Email and Thesis ID are required fields"
      });
    }

    // Find the thesis by ID
    const thesis = await db.thesis.findUnique({
      where: { id: thesisId },
    });

    if (!thesis) {
      return res.status(404).json({
        success: false,
        message: "Thesis not found"
      });
    }

    // Find the user by email
    const memberToRemove = await db.user.findUnique({
      where: { email },
      include: { student: true },
    });

    if (!memberToRemove || !memberToRemove.student) {
      return res.status(404).json({
        success: false,
        message: "User not found or is not a student"
      });
    }

    // Check permissions
    let canRemove = false;

    if (userRole === 'ADMIN') {
      // Admins can remove any member except the creator
      const creator = await db.thesisMember.findFirst({
        where: { thesisId, creator: true },
      });

      if (memberToRemove.student.id === creator.studentId) {
        return res.status(403).json({
          success: false,
          message: "Admin cannot remove the creator of the thesis"
        });
      }

      canRemove = true;
    } else if (userRole === 'STUDENT') {
      // Students can only remove members from their own theses
      const student = await db.student.findUnique({
        where: { userId },
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found for this user"
        });
      }

      // Check if the user is the creator of the thesis
      const isCreator = await db.thesisMember.findFirst({
        where: { thesisId, studentId: student.id, creator: true },
      });

      if (!isCreator) {
        return res.status(403).json({
          success: false,
          message: "Only the creator of the thesis can remove members"
        });
      }
    

      // Check if the member to be removed is part of the same thesis
      const memberInThesis = await db.thesisMember.findFirst({
        where: { thesisId, studentId: memberToRemove.student.id },
      });

      if (!memberInThesis) {
        return res.status(403).json({
          success: false,
          message: "The specified user is not a member of this thesis"
        });
      }

      canRemove = true;
    } else {
      return res.status(403).json({
        success: false,
        message: "Only admins and students who created the thesis can remove members"
      });
    }

    if (canRemove) {
      // Remove the member from the thesis
      await db.thesisMember.delete({
        where: { thesisId_studentId: { thesisId, studentId: memberToRemove.student.id } },
      });

      res.status(200).json({
        success: true,
        message: "Thesis member removed successfully"
      });
    }
  } catch (error) {
    console.error("Error removing thesis member:", error);
    res.status(500).json({
      success: false,
      message: "Server error while removing thesis member",
      error: error.message
    });
  }
}

module.exports = removeThesisMember;