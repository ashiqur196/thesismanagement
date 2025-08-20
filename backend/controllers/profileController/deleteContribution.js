const db = require("../../db/db");

async function deleteContribution(req, res) {
  try {
    const contributionId = parseInt(req.query.id);
    const userId = req.userData.userId;
    const userRole = req.userData.role;

    console.log(req.params);
    // Validate contribution ID
    if (!contributionId || isNaN(contributionId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid contribution ID" 
      });
    }

    // First find the contribution with owner information
    const contribution = await db.contribution.findUnique({
      where: { id: contributionId },
      include: {
        student: { select: { userId: true } },
        faculty: { select: { userId: true } }
      }
    });

    if (!contribution) {
      return res.status(404).json({ 
        success: false, 
        message: "Contribution not found" 
      });
    }

    // Verify ownership
    let isOwner = false;
    if (userRole === 'STUDENT' && contribution.student) {
      isOwner = contribution.student.userId === userId;
    } else if (userRole === 'FACULTY' && contribution.faculty) {
      isOwner = contribution.faculty.userId === userId;
    }

    if (!isOwner && userRole !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: "You are not authorized to delete this contribution" 
      });
    }

    // Delete the contribution
    await db.contribution.delete({
      where: { id: contributionId }
    });

    res.json({ 
      success: true, 
      message: "Contribution deleted successfully" 
    });

  } catch (error) {
    console.error("Error deleting contribution:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while deleting contribution",
      error: error.message 
    });
  }
}

module.exports = deleteContribution;