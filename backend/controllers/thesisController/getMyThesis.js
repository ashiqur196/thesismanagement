const db = require("../../db/db");

async function getMyThesis(req, res) {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const userId = req.userData.userId;
    const userRole = req.userData.role;

    // Validate pagination parameters
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters"
      });
    }

    // Base query conditions
    const whereConditions = {
      OR: [
        { title: { contains: search } },
        { Code: { contains: search } }
      ]
    };

    // Define valid status values
    const validStatusValues = ['ACTIVE', 'INACTIVE', 'PENDING_SUPERVISOR'];

    // Add status filter if provided and valid
    if (status && validStatusValues.includes(status)) {
      whereConditions.status = status;
    }

    // Add role-specific conditions
    if (userRole === 'STUDENT') {
      whereConditions.members = {
        some: {
          student: {
            userId: userId
          }
        }
      };
    } else if (userRole === 'FACULTY') {
      whereConditions.OR = [
        ...whereConditions.OR,
        {
          supervisor: {
            userId: userId
          }
        }
      ];
    } else {
      return res.status(403).json({
        success: false,
        message: "Only students and faculty can access theses"
      });
    }

    // Get total count for pagination
    const totalItems = await db.thesis.count({
      where: whereConditions
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limitNumber);

    // Get paginated results
    const theses = await db.thesis.findMany({
      where: whereConditions,
      include: {
        supervisor: {
          select: {
            id: true,
            name: true,
            department: true
          }
        },
        members: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                department: true
              }
            }
          }
        }
      },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // For case-insensitive search, filter results in JavaScript if needed
    const filteredTheses = search ? theses.filter(thesis => 
      thesis.title.toLowerCase().includes(search.toLowerCase()) || 
      thesis.Code.toLowerCase().includes(search.toLowerCase())
    ) : theses;

    res.json({
      success: true,
      data: {
        theses: filteredTheses,
        page: pageNumber,
        totalPages,
        totalItems,
        limit: limitNumber
      }
    });

  } catch (error) {
    console.error("Error fetching theses:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching theses",
      error: error.message
    });
  }
}

module.exports = getMyThesis;