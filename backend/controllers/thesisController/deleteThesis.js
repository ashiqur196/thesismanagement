const db = require("../../db/db");

async function deleteThesis(req, res) {
  try {
    const { thesisId } = req.params;
    const userId = req.userData.userId;
    const userRole = req.userData.role;

    // Validate required field
    if (!thesisId) {
      return res.status(400).json({
        success: false,
        message: "Thesis ID is a required parameter"
      });
    }

    // Only students and admins can delete theses
    if (userRole !== 'STUDENT' && userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Only students and admins can delete theses"
      });
    }

    // Check if the thesis exists
    const thesis = await db.thesis.findUnique({
      where: { id: parseInt(thesisId) },
      include: {
        members: true
      }
    });

    if (!thesis) {
      return res.status(404).json({
        success: false,
        message: "Thesis not found"
      });
    }

    // Check if the user is authorized to delete the thesis
    const isAuthorized = (
      (userRole === 'STUDENT' && thesis.members.some(member => member.studentId === userId && member.creator)) ||
      userRole === 'ADMIN'
    );

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this thesis"
      });
    }

    // Check if the thesis has a supervisor
    if (thesis.supervisorId !== null) {
      return res.status(403).json({
        success: false,
        message: "Thesis cannot be deleted as it has an assigned supervisor"
      });
    }

    // Delete associated supervisor requests
    await db.supervisorRequest.deleteMany({
      where: { thesisId: parseInt(thesisId) }
    });

    // Delete the thesis
    await db.thesis.delete({
      where: { id: parseInt(thesisId) }
    });

    res.status(200).json({
      success: true,
      message: "Thesis deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting thesis:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting thesis",
      error: error.message
    });
  }
}

module.exports = deleteThesis;