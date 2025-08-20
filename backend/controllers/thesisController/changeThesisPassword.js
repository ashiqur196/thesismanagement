const db = require("../../db/db");

async function changeThesisPassword(req, res) {
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

    // Check if user has permission to change this thesis's password
    let hasPermission = false;

    if (userRole === 'STUDENT') {
      // Check if student is a member and creator of this thesis
      const studentMembership = await db.thesisMember.findFirst({
        where: {
          thesisId: thesisIdInt,
          student: {
            userId: userId
          },
          creator: true // Only the creator can change the join password
        }
      });
      hasPermission = !!studentMembership;
    } else if (userRole === 'FACULTY') {
      // Check if faculty is supervisor of this thesis
      const faculty = await db.faculty.findUnique({
        where: { userId: userId },
        select: { id: true }
      });

      if (faculty) {
        const thesis = await db.thesis.findUnique({
          where: { id: thesisIdInt },
          select: { supervisorId: true }
        });
        
        // Faculty has permission if they are the supervisor
        hasPermission = thesis && thesis.supervisorId === faculty.id;
      }
    } else if (userRole === 'ADMIN') {
      // Admin has permission to edit all theses
      hasPermission = true;
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to change the password for this thesis"
      });
    }

    // Generate the new random join password (using your existing function)
    const newJoinPassword = generateRandomPassword();

    // Update the thesis with the new join password
    const updatedThesis = await db.thesis.update({
      where: {
        id: thesisIdInt
      },
      data: {
        joinPassword: newJoinPassword, // Directly update the field
        updatedAt: new Date()
      },
    });

    res.json({
      success: true,
      message: "Thesis join password updated successfully",
      newPassword: newJoinPassword // Send the new password back in the response
    });

  } catch (error) {
    console.error("Error changing thesis password:", error);
    
    // Handle Prisma errors
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "Thesis not found"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while changing thesis password",
      error: error.message
    });
  }
}

// Your original password generator function
function generateRandomPassword() {
  const length = 8;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = changeThesisPassword;