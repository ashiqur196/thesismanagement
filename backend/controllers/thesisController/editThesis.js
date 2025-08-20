const db = require("../../db/db");

async function editThesis(req, res) {
  try {
    const { thesisId } = req.params;
    const { title, description, researchTags } = req.body;
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

    // Check if user has permission to edit this thesis
    let hasPermission = false;

    if (userRole === 'STUDENT') {
      // Check if student is a member and creator of this thesis
      const studentMembership = await db.thesisMember.findFirst({
        where: {
          thesisId: thesisIdInt,
          student: {
            userId: userId
          },
          creator: true // Only creator can edit
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
        message: "You don't have permission to edit this thesis"
      });
    }

    // Validate input data
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Thesis title is required"
      });
    }

    if (title.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Thesis title cannot exceed 200 characters"
      });
    }

    if (description && description.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 2000 characters"
      });
    }

    // Prepare update data
    const updateData = {
      title: title.trim(),
      updatedAt: new Date()
    };

    // Add optional fields if provided
    if (description !== undefined) {
      updateData.description = description.trim() || null;
    }

    if (researchTags !== undefined) {
      // Convert researchTags to proper format (remove empty tags, trim, etc.)
      const formattedTags = researchTags
        .split(';')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .join(';');
      
      updateData.researchTags = formattedTags || null;
    }

    // Update the thesis
    const updatedThesis = await db.thesis.update({
      where: {
        id: thesisIdInt
      },
      data: updateData,
    });

    res.json({
      success: true,
      message: "Thesis updated successfully",
      thesis: updatedThesis
    });

  } catch (error) {
    console.error("Error updating thesis:", error);
    
    // Handle Prisma errors
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "Thesis not found"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating thesis",
      error: error.message
    });
  }
}

module.exports = editThesis;