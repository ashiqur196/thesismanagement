// controllers/facultyController/getFacultyById.js
const db = require("../../db/db");

async function getFacultyById(req, res) {
  try {
    const { id } = req.params;

    // Validate ID parameter
    const facultyId = parseInt(id);
    if (isNaN(facultyId) || facultyId < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty ID parameter"
      });
    }

    // Get faculty by ID with all related information including contributions
    const faculty = await db.faculty.findUnique({
      where: {
        id: facultyId
      },
      include: {
        user: {
          select: {
            email: true,
            image: true,
            createdAt: true,
            updatedAt: true
          }
        },
        contributions: {
          select: {
            id: true,
            title: true,
            subtitle: true,
            description: true,
            url: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
      }
    });

    // Check if faculty exists
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found"
      });
    }

    // Transform researchInterest from string to array format
    const facultyWithResearchInterests = {
      ...faculty,
      researchInterest: faculty.researchInterest 
        ? faculty.researchInterest.split(';').map(item => item.trim()).filter(item => item !== '')
        : []
    };

    res.json({
      success: true,
      data: {
        faculty: facultyWithResearchInterests
      }
    });

  } catch (error) {
    console.error("Error fetching faculty by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching faculty details",
      error: error.message
    });
  }
}

module.exports = getFacultyById;