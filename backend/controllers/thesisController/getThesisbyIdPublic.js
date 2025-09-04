const db = require("../../db/db");

async function getThesisbyIdPublic(req, res) {
  try {
    const { thesisId } = req.params;
    const userId = req.userData.userId;
    const userRole = req.userData.role;

    // Validate thesisId parameter
    if (!thesisId || isNaN(parseInt(thesisId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid thesis ID",
      });
    }

    const thesisIdInt = parseInt(thesisId);

    // Get the thesis with all related data
    const thesis = await db.thesis.findUnique({
      where: {
        id: thesisIdInt,
      },
      select: {
        id: true,
        title: true,
        description: true,
        researchTags: true,
        status: true,
        createdAt: true,
        supervisorId: true,
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
        supervisor: {
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
    });

    if (!thesis) {
      return res.status(404).json({
        success: false,
        message: "Thesis not found",
      });
    }

    res.json({
      success: true,
      thesis: thesis,
    });
  } catch (error) {
    console.error("Error fetching thesis:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching thesis",
      error: error.message,
    });
  }
}

module.exports = getThesisbyIdPublic;
