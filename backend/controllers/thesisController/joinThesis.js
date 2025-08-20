const db = require("../../db/db");

async function joinThesis(req, res) {
  try {
    const { code, password } = req.body;
    const userId = req.userData.userId;
    const userRole = req.userData.role;

    // Validate required fields
    if (!code || !password) {
      return res.status(400).json({
        success: false,
        message: "Thesis code and password are required"
      });
    }

    // Only students can join theses
    if (userRole !== 'STUDENT') {
      return res.status(403).json({
        success: false,
        message: "Only students can join theses"
      });
    }

    // Get the student profile of the user
    const student = await db.student.findUnique({
      where: { userId: userId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found for this user"
      });
    }

    // Find the thesis with the provided code
    const thesis = await db.thesis.findUnique({
      where: { Code: code },
    });

    if (!thesis) {
      return res.status(404).json({
        success: false,
        message: "Thesis not found with the provided code"
      });
    }

    // Check if the password matches
    if (thesis.joinPassword !== password) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password for this thesis"
      });
    }

    // Check if the student is already a member
    const existingMember = await db.thesisMember.findFirst({
      where: {
        thesisId: thesis.id,
        studentId: student.id
      }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this thesis"
      });
    }

    // Add the student as a member
    await db.thesisMember.create({
      data: {
        thesisId: thesis.id,
        studentId: student.id,
        creator: false // Not the creator since they're joining
      }
    });

    res.status(200).json({
      success: true,
      message: "Successfully joined the thesis"
    });

  } catch (error) {
    console.error("Error joining thesis:", error);
    res.status(500).json({
      success: false,
      message: "Server error while joining thesis",
      error: error.message
    });
  }
}

module.exports = joinThesis;