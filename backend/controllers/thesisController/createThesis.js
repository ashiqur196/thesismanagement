const db = require("../../db/db");

async function createThesis(req, res) {
  try {
    const { title } = req.body;
    const userId = req.userData.userId;
    const userRole = req.userData.role;

    // Validate required field
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is a required field"
      });
    }

    // Only students can create theses
    if (userRole !== 'STUDENT') {
      return res.status(403).json({
        success: false,
        message: "Only students can create theses"
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

    // Generate a unique code for the thesis
    const code = generateThesisCode(title);

    // Create the thesis with default values
    await db.thesis.create({
      data: {
        title,
        description: null, // Set to null as not provided
        Code: code,
        joinPassword: generateRandomPassword(), // Generate a random password
        status: 'PENDING_SUPERVISOR',
        members: {
          create: {
            studentId: student.id,
            creator: true // Mark this student as the creator
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: "Thesis created successfully"
    });

  } catch (error) {
    console.error("Error creating thesis:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating thesis",
      error: error.message
    });
  }
}

// Helper function to generate a thesis code from title
function generateThesisCode(title) {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  const initials = title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 3); // Get up to 3 initials
  return `${initials}-${randomSuffix}`;
}


// Helper function to generate a random password
function generateRandomPassword() {
  const length = 8;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = createThesis;