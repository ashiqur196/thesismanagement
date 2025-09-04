const db = require("../../db/db");

async function getThesisRequests(req, res) {
  try {
    const userId = req.userData.userId;
    const userRole = req.userData.role;
    const { thesisId } = req.params;

    // Only students can access this endpoint
    if (userRole !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message: "Only students can access thesis requests",
      });
    }

    // thesisId query parameter is required for students
    if (!thesisId) {
      return res.status(400).json({
        success: false,
        message: "thesisId query parameter is required for students",
      });
    }

    // Validate thesisId is a number
    const parsedThesisId = parseInt(thesisId);
    
    if (isNaN(parsedThesisId)) {
      return res.status(400).json({
        success: false,
        message: "thesisId must be a valid number",
      });
    }

    // Check if student is a member of the requested thesis
    const thesisMembership = await db.thesisMember.findFirst({
      where: {
        thesisId: parsedThesisId,
        student: {
          userId: userId,
        },
      },
    });

    if (!thesisMembership) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this thesis",
      });
    }

    // Get PENDING requests for the specific thesis
    const requests = await db.supervisorRequest.findMany({
      where: {
        status: "PENDING",
        thesisId: parsedThesisId,
      },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            department: true,
            researchInterest: true,
            user: {
              select: {
                email: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform research interest from string to array format
    const formattedRequests = requests.map((request) => ({
      id: request.id,
      facultyId: request.facultyId,
      message: request.message,
      status: request.status,
      createdAt: request.createdAt,
      faculty: {
        id: request.faculty.id,
        name: request.faculty.name,
        department: request.faculty.department,
        researchInterest: request.faculty.researchInterest
          ? request.faculty.researchInterest
              .split(";")
              .map((item) => item.trim())
              .filter((item) => item !== "")
          : [],
        user: {
          email: request.faculty.user.email,
          image: request.faculty.user.image,
        },
      },
    }));

    res.json({
      success: true,
      data: {
        requests: formattedRequests,
      },
    });
  } catch (error) {
    console.error("Error fetching thesis requests:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching thesis requests",
      error: error.message,
    });
  }
}

module.exports = getThesisRequests;