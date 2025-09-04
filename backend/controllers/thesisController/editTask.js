// editTask.js
const db = require("../../db/db");

async function editTask(req, res) {
  try {
    const { taskId } = req.params;
    const { title, description, dueDate, status } = req.body;
    const userId = req.userData.userId;
    const userRole = req.userData.role;

    // Authorization check - only faculty can edit tasks
    if (userRole !== "FACULTY") {
      return res.status(403).json({
        success: false,
        message: "Only faculty can edit tasks",
      });
    }

    // Validate task ID
    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required",
      });
    }

    // Check if task exists and get related data
    const existingTask = await db.task.findUnique({
      where: { id: parseInt(taskId) },
      include: {
        thesis: {
          include: { supervisor: true },
        },
        faculty: true,
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if faculty is the supervisor of the thesis
    if (
      !existingTask.thesis.supervisor ||
      existingTask.thesis.supervisor.userId !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You must be the supervisor of this thesis to edit tasks",
      });
    }

    if (existingTask.thesis.status === "INACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Cannot edit tasks for completed thesis",
      });
    }

    // Prepare update data
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined)
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (status !== undefined) updateData.status = status;

    // Update the task
    const updatedTask = await db.task.update({
      where: { id: parseInt(taskId) },
      data: updateData,
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


    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating task",
      error: error.message,
    });
  }
}

module.exports = editTask;
