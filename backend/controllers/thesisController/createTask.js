// createTask.js
const db = require("../../db/db");

async function createTask(req, res) {
  try {
    const { title, description, dueDate, thesisId } = req.body;
    const userId = req.userData.userId;
    const userRole = req.userData.role;

    // Authorization check - only faculty can create tasks
    if (userRole !== "FACULTY") {
      return res.status(403).json({
        success: false,
        message: "Only faculty can create tasks",
      });
    }

    // Validate required fields
    if (!title || !thesisId) {
      return res.status(400).json({
        success: false,
        message: "Title and thesis ID are required",
      });
    }

    // Check if faculty is the supervisor of the thesis
    const thesis = await db.thesis.findUnique({
      where: { id: parseInt(thesisId) },
      include: { supervisor: true },
    });

    if (!thesis) {
      return res.status(404).json({
        success: false,
        message: "Thesis not found",
      });
    }

    if (!thesis.supervisor || thesis.supervisor.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You must be the supervisor of this thesis to create tasks",
      });
    }

    if (thesis.status === "INACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Thesis already completed.",
      });
    }

    // Create the task
    const task = await db.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        thesisId: parseInt(thesisId),
        facultyId: thesis.supervisor.id,
      },
      include: {
        thesis: {
          select: {
            id: true,
            title: true,
            Code: true,
          },
        },
        faculty: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create notifications for all thesis members
    const members = await db.thesisMember.findMany({
      where: { thesisId: parseInt(thesisId) },
      include: { student: true },
    });

    for (const member of members) {
      await db.notification.create({
        data: {
          userId: member.student.userId,
          facultyId: thesis.supervisor.id,
          thesisId: parseInt(thesisId),
          type: "TASK_ASSIGNED",
          title: "New Task Assigned",
          message: `A new task "${title}" has been assigned to you for thesis "${thesis.title}"`,
          relatedId: task.id,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating task",
      error: error.message,
    });
  }
}

module.exports = createTask;
