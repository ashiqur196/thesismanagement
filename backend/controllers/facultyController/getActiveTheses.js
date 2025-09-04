const db = require("../../db/db");

async function getActiveTheses(req, res) {
  try {
    const userId = req.userData.userId;
    const userRole = req.userData.role;
    const { page = 1, limit = 10, search = '' } = req.query;

    // Only faculty can access this endpoint
    if (userRole !== "FACULTY") {
      return res.status(403).json({
        success: false,
        message: "Only faculty can access active theses",
      });
    }

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
    const whereConditions = {
      supervisor: {
        userId: userId
      },
      status: "ACTIVE"
    };

    // Handle search query - case insensitive search for title and code
    if (search && search.trim() !== '') {
      whereConditions.OR = [
        { title: { contains: search } },
        { Code: { contains: search } },
      ];
    }

    // Get total count for pagination
    const totalItems = await db.thesis.count({
      where: whereConditions
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limitNumber);

    // Get paginated results with members and their user info
    const theses = await db.thesis.findMany({
      where: whereConditions,
      include: {
        members: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    email: true,
                    image: true
                  }
                }
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

    // Format the response
    const formattedTheses = theses.map(thesis => ({
      id: thesis.id,
      title: thesis.title,
      status: thesis.status,
      researchTags: thesis.researchTags 
        ? thesis.researchTags.split(';').map(item => item.trim()).filter(item => item !== '')
        : [],
      createdAt: thesis.createdAt,
      updatedAt: thesis.updatedAt,
      members: thesis.members.map(member => ({
        id: member.student.id,
        name: member.student.name,
        user: {
          image: member.student.user.image
        }
      }))
    }));

    res.json({
      success: true,
      data: {
        theses: formattedTheses,
        pagination: {
          page: pageNumber,
          totalPages,
          totalItems,
          limit: limitNumber,
          hasNext: pageNumber < totalPages,
          hasPrev: pageNumber > 1
        }
      }
    });

  } catch (error) {
    console.error("Error fetching active theses:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching active theses",
      error: error.message,
    });
  }
}

module.exports = getActiveTheses;