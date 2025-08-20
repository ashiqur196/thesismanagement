const db = require("../../db/db");

async function addContribution(req, res) {
  try {
    const { title, subtitle, description, url } = req.body;
    const userId = req.userData.userId;
    const userRole = req.userData.role;

    // Validate required fields
    if (!title || !subtitle || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, subtitle, and description are required fields"
      });
    }

    // Get the user with their student/faculty profile
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        faculty: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    let contributionData = {
      title,
      subtitle,
      description,
      url: url || null, // Set to null if url is not provided
    };

    // Add the appropriate relation based on user role
    if (userRole === 'STUDENT') {
      if (!user.student) {
        return res.status(400).json({
          success: false,
          message: "Student profile not found for this user"
        });
      }
      contributionData.student = {
        connect: { id: user.student.id }
      };
    } else if (userRole === 'FACULTY') {
      if (!user.faculty) {
        return res.status(400).json({
          success: false,
          message: "Faculty profile not found for this user"
        });
      }
      contributionData.faculty = {
        connect: { id: user.faculty.id }
      };
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid user role for creating contributions"
      });
    }

    // Create the contribution
    const newContribution = await db.contribution.create({
      data: contributionData,
    });

    res.status(201).json({
      success: true,
      message: "Contribution added successfully",
      data: newContribution
    });

  } catch (error) {
    console.error("Error adding contribution:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding contribution",
      error: error.message
    });
  }
}

module.exports = addContribution;