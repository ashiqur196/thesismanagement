const db = require("../../db/db");

async function updateContribution(req, res) {
  try {
    const { title, subtitle, description, url, contributionId } = req.body;
    const userId = req.userData.userId;
    const userRole = req.userData.role;

    // Validate required fields
    if (!contributionId || !title || !subtitle || !description) {
      return res.status(400).json({
        success: false,
        message: "Contribution ID, title, subtitle, and description are required"
      });
    }

    // First, find the existing contribution with owner information
    const existingContribution = await db.contribution.findUnique({
      where: { id: parseInt(contributionId) },
      include: {
        student: { select: { userId: true } },
        faculty: { select: { userId: true } }
      }
    });

    if (!existingContribution) {
      return res.status(404).json({
        success: false,
        message: "Contribution not found"
      });
    }

    // Verify ownership
    let isOwner = false;
    if (userRole === 'STUDENT' && existingContribution.student) {
      isOwner = existingContribution.student.userId === userId;
    } else if (userRole === 'FACULTY' && existingContribution.faculty) {
      isOwner = existingContribution.faculty.userId === userId;
    }

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this contribution"
      });
    }

    // Prepare update data
    const updateData = {
      title,
      subtitle,
      description,
      url: url || null
    };

    // Update the contribution
    const updatedContribution = await db.contribution.update({
      where: { id: parseInt(contributionId) },
      data: updateData
    });

    res.json({
      success: true,
      message: "Contribution updated successfully",
      data: updatedContribution
    });

  } catch (error) {
    console.error("Error updating contribution:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating contribution",
      error: error.message
    });
  }
}

module.exports = updateContribution;