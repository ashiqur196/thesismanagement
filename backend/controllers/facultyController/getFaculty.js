// controllers/facultyController/getFaculty.js
const db = require("../../db/db");

async function getFaculty(req, res) {
  try {
    const { page = 1, limit = 10, search = '', department } = req.query;

    // Validate pagination parameters
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters"
      });
    }

    // Build where conditions
    const whereConditions = {};

    // Handle search query - case insensitive search for name
    if (search) {
      whereConditions.OR = [
        { name: { contains: search } },
        { department: { contains: search } }
      ];
    }

    // Handle department filter - only add if department is provided and not empty
    if (department && department.trim() !== '') {
      whereConditions.department = { contains: department };
    }

    // Get total count for pagination
    const totalItems = await db.faculty.count({
      where: whereConditions
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limitNumber);

    // Get paginated results
    const faculties = await db.faculty.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            email: true,
            image: true
          }
        }
      },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
    });

    // Transform researchInterest from string to array format
    const facultiesWithResearchInterests = faculties.map(faculty => ({
      ...faculty,
      researchInterest: faculty.researchInterest 
        ? faculty.researchInterest.split(';').map(item => item.trim()).filter(item => item !== '')
        : []
    }));

    res.json({
      success: true,
      data: {
        faculties: facultiesWithResearchInterests,
        page: pageNumber,
        totalPages,
        totalItems,
        limit: limitNumber
      }
    });

  } catch (error) {
    console.error("Error fetching faculties:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching faculties",
      error: error.message
    });
  }
}

module.exports = getFaculty;