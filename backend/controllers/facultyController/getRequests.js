const db = require("../../db/db");

async function getRequests(req, res) {
  try {
    console.log("func invoked")
    const userId = req.userData.userId;
    const userRole = req.userData.role;

    // Only faculty can access this endpoint
    if (userRole !== "FACULTY") {
      return res.status(403).json({
        success: false,
        message: "Only faculty can access faculty requests",
      });
    }

    // Get all PENDING requests sent to this faculty
    const requests = await db.supervisorRequest.findMany({
      where: {
        status: "PENDING",
        faculty: {
          userId: userId,
        },
      },
      include: {
        thesis: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            researchTags: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform research tags from string to array format
    const formattedRequests = requests.map((request) => ({
      id: request.id,
      thesisId: request.thesisId,
      message: request.message,
      status: request.status,
      createdAt: request.createdAt,
      thesis: {
        id: request.thesis.id,
        title: request.thesis.title,
        status: request.thesis.status,
        createdAt: request.thesis.createdAt,
        researchTags: request.thesis.researchTags
          ? request.thesis.researchTags
              .split(";")
              .map((item) => item.trim())
              .filter((item) => item !== "")
          : [],
      },
    }));

    res.json({
      success: true,
      data: {
        requests: formattedRequests,
      },
    });
  } catch (error) {
    console.error("Error fetching faculty requests:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching faculty requests",
      error: error.message,
    });
  }
}

module.exports = getRequests;