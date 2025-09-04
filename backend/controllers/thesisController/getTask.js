const db = require("../../db/db");

async function getTask(req, res) {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;
    const { thesisId } = req.params;

    const userId = req.userData.userId;
    const userRole = req.userData.role;

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

    // Verify user has access to this thesis
    let hasAccess = false;

    if (userRole === "STUDENT") {
      // Check if student is a member of this thesis
      const membership = await db.thesisMember.findFirst({
        where: {
          thesisId: parseInt(thesisId),
          student: {
            userId: userId,
          },
        },
      });
      hasAccess = !!membership;
    } else if (userRole === "FACULTY") {
      // Check if faculty is supervisor of this thesis
      const thesis = await db.thesis.findFirst({
        where: {
          id: parseInt(thesisId),
          supervisor: {
            userId: userId,
          },
        },
      });
      hasAccess = !!thesis;
    } else {
      return res.status(403).json({
        success: false,
        message: "Only students and faculty can access tasks",
      });
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this thesis",
      });
    }

    // Base query conditions
    const whereConditions = {
      thesisId: parseInt(thesisId),
      OR: [
        { title: { contains: search } },
        { description: { contains: search } },
      ],
    };

    // Add status filter if provided and valid
    const validStatusValues = [
      "PENDING",
      "IN_PROGRESS",
      "COMPLETED",
      "OVERDUE",
    ];
    if (status && validStatusValues.includes(status)) {
      whereConditions.status = status;
    }

    // Get total count for pagination
    const totalItems = await db.task.count({
      where: whereConditions,
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limitNumber);

    // Get paginated results
    const tasks = await db.task.findMany({
      where: whereConditions,
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
        submissions: {
          select: {
            id: true,
            taskId: true,
            content: true,
            fileUrl: true,
            feedback: true,
            grade: true,
            submittedAt: true,
            updatedAt: true,
          },
        },
      },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      orderBy: {
        createdAt: "desc",
      },
    });

    // For case-insensitive search, filter results in JavaScript if needed
    const filteredTasks = search
      ? tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(search.toLowerCase()) ||
            (task.description &&
              task.description.toLowerCase().includes(search.toLowerCase()))
        )
      : tasks;

    res.json({
      success: true,
      data: {
        tasks: filteredTasks,
        page: pageNumber,
        totalPages,
        totalItems,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching task",
      error: error.message,
    });
  }
}

module.exports = getTask;
