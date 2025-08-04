const db = require("../../db/db");
async function updateProfile(req, res) {
  try {
    const { name, about, researchInterest, department } = req.body;
    const userId = req.userData.userId;

    // First get the user to determine their role
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        faculty: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const updateData = {
      name,
      about,
      researchInterest,
      department
    };

    // Handle file upload if present
    if (req.file) {
      console.log(req.file)
      updateData.user = {
        update: {
          image: req.file.filename // Store the full path to the image
        }
      };
    }

    let updatedProfile;
    
    if (user.role === 'STUDENT') {
      updatedProfile = await db.student.update({
        where: { userId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              image: true,
              role: true,
              createdAt: true,
              updatedAt: true
            }
          }
        }
      });
    } else if (user.role === 'FACULTY') {
      updatedProfile = await db.faculty.update({
        where: { userId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              image: true,
              role: true,
              createdAt: true,
              updatedAt: true
            }
          }
        }
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "Admin profiles cannot be updated this way"
      });
    }

    // Construct the response with public image URL
    const responseData = {
      ...updatedProfile,
      image: updatedProfile.user.image 
        ? `/profile-image/${updatedProfile.user.image}` 
        : null
    };

    // Remove the nested user object if it exists
    if (responseData.user) {
      delete responseData.user;
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: responseData
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
}

module.exports = updateProfile;