const db = require("../../db/db");

async function updateThesisStatus(req, res) {
  try {
    const { id, status } = req.body;
    const userId = req.userData.userId;
    const userRole = req.userData.role;

    // Validate required fields
    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: "Thesis ID and status are required parameters"
      });
    }

    // Only faculty members can update the thesis status
    if (userRole !== 'FACULTY') {
      return res.status(403).json({
        success: false,
        message: "Only faculty members can update the thesis status"
      });
    }

    // Check if the thesis exists
    const thesis = await db.thesis.findUnique({
      where: { id: parseInt(id) },
      include: {
        supervisor: true
      }
    });

    if (!thesis) {
      return res.status(404).json({
        success: false,
        message: "Thesis not found"
      });
    }

    // Check if the user is authorized to update the thesis status
    const isAuthorized = (
      (userRole === 'FACULTY' && thesis.supervisorId === userId)
    );

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this thesis status"
      });
    }

    // Update the thesis status
    const updatedThesis = await db.thesis.update({
      where: { id: parseInt(id) },
      data: {
        status: status
      }
    });

    res.status(200).json({
      success: true,
      message: "Thesis status updated successfully",
      thesis: updatedThesis
    });

  } catch (error) {
    console.error("Error updating thesis status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating thesis status",
      error: error.message
    });
  }
}

module.exports = updateThesisStatus;