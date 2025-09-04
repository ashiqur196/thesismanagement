const db = require("../../db/db");

async function getTaskStats(req, res) {
  try {
    const { thesisId } = req.params;
    const userId = req.userData.userId;
    const userRole = req.userData.role;

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
        message: "Only students and faculty can access task statistics",
      });
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this thesis",
      });
    }

    // Get task statistics in parallel for better performance
    const [totalTasks, completedTasks, pendingTasks] = await Promise.all([
      // Total tasks
      db.task.count({
        where: {
          thesisId: parseInt(thesisId),
        },
      }),
      // Completed tasks
      db.task.count({
        where: {
          thesisId: parseInt(thesisId),
          status: "COMPLETED",
        },
      }),
      // Pending tasks
      db.task.count({
        where: {
          thesisId: parseInt(thesisId),
          status: "PENDING",
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
      },
    });
  } catch (error) {
    console.error("Error fetching task statistics:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching task statistics",
      error: error.message,
    });
  }
}

module.exports = getTaskStats;
