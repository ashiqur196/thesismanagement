const db = require("../../db/db");

async function getCompletedTheses(req, res) {
  try {
    const userId = req.userData.userId;
    const userRole = req.userData.role;
    const {
      page = 1,
      limit = 10,
      search = "",
      sort = "desc",
      year = "",
      month = "",
    } = req.query;

    // Only faculty can access this endpoint
    if (userRole !== "FACULTY") {
      return res.status(403).json({
        success: false,
        message: "Only faculty can access completed theses",
      });
    }

    // Validate pagination parameters
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    if (
      isNaN(pageNumber) ||
      isNaN(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    // Validate sort parameter
    const sortOrder = sort.toLowerCase() === "asc" ? "asc" : "desc";

    // Build where conditions
    const whereConditions = {
      supervisor: {
        userId: userId,
      },
      status: {
        in: ["INACTIVE"], // Include various inactive statuses
      },
    };

    // Handle search query - case insensitive search for title and code
    if (search && search.trim() !== "") {
      whereConditions.OR = [
        { title: { contains: search } },
        { Code: { contains: search } },
      ];
    }

    // Handle year filter
    if (year && year.trim() !== "") {
      const yearInt = parseInt(year);
      if (!isNaN(yearInt)) {
        whereConditions.updatedAt = {
          gte: new Date(yearInt, 0, 1), // January 1st of the year
          lt: new Date(yearInt + 1, 0, 1), // January 1st of next year
        };
      }
    }

    // Handle month filter (requires year to be specified)
    if (month && month.trim() !== "" && year && year.trim() !== "") {
      const yearInt = parseInt(year);
      const monthInt = parseInt(month) - 1; // JavaScript months are 0-indexed

      if (
        !isNaN(yearInt) &&
        !isNaN(monthInt) &&
        monthInt >= 0 &&
        monthInt <= 11
      ) {
        whereConditions.updatedAt = {
          gte: new Date(yearInt, monthInt, 1), // First day of the month
          lt: new Date(yearInt, monthInt + 1, 1), // First day of next month
        };
      }
    }

    // Get total count for pagination
    const totalItems = await db.thesis.count({
      where: whereConditions,
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
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      orderBy: {
        updatedAt: sortOrder,
      },
    });

    // Format the response
    const formattedTheses = theses.map((thesis) => ({
      id: thesis.id,
      title: thesis.title,
      status: thesis.status,
      researchTags: thesis.researchTags
        ? thesis.researchTags
            .split(";")
            .map((item) => item.trim())
            .filter((item) => item !== "")
        : [],
      createdAt: thesis.createdAt,
      updatedAt: thesis.updatedAt,
      members: thesis.members.map((member) => ({
        id: member.student.id,
        name: member.student.name,
        user: {
          image: member.student.user.image,
        },
      })),
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
          hasPrev: pageNumber > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching completed theses:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching completed theses",
      error: error.message,
    });
  }
}

module.exports = getCompletedTheses;
