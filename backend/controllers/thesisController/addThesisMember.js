const db = require("../../db/db");

async function addThesisMember(req, res) {
  try {
    const { email } = req.body;
    const { thesisId } = req.params;
    const userId = req.userData.userId;
    const userRole = req.userData.role;

    // Validate required fields
    if (!email || !thesisId) {
      return res.status(400).json({
        success: false,
        message: "Email and Thesis ID are required fields"
      });
    }
    const thesisIdInt = parseInt(thesisId);

    // Only students can add members to their theses
    if (userRole !== 'STUDENT') {
      return res.status(403).json({
        success: false,
        message: "Only students can add members to their theses"
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

    // Find the thesis by ID
    const thesis = await db.thesis.findUnique({
      where: { id: thesisIdInt },
    });

    if (!thesis) {
      return res.status(404).json({
        success: false,
        message: "Thesis not found"
      });
    }

    // Check if the user is the creator of the thesis
    const isCreator = await db.thesisMember.findFirst({
      where: { thesisId: thesisIdInt, studentId: student.id, creator: true },
    });

    if (!isCreator) {
      return res.status(403).json({
        success: false,
        message: "Only the creator of the thesis can add members"
      });
    }

    // Find the user by email and check if they are a student
    const newMember = await db.user.findUnique({
      where: { email },
      include: { student: true },
    });

    if (!newMember || !newMember.student) {
      return res.status(404).json({
        success: false,
        message: "User not found or is not a student"
      });
    }

    // Add the new member to the thesis
    await db.thesisMember.create({
      data: {
        thesisId: thesisIdInt,
        studentId: newMember.student.id,
        creator: false, // New members are not creators by default
      }
    });

    res.status(201).json({
      success: true,
      message: "Thesis member added successfully"
    });

  } catch (error) {
    console.error("Error adding thesis member:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding thesis member",
      error: error.message
    });
  }
}

module.exports = addThesisMember;