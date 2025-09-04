// deleteTask.js
const db = require("../../db/db");

async function deleteTask(req, res) {
  try {
    const { taskId } = req.params;
    const userId = req.userData.userId;
    const userRole = req.userData.role;

    // Authorization check - only faculty can delete tasks
    if (userRole !== "FACULTY") {
      return res.status(403).json({
        success: false,
        message: "Only faculty can delete tasks",
      });
    }

    // Validate task ID
    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required",
      });
    }

    // Find the task with faculty information
    const task = await db.task.findUnique({
      where: { id: parseInt(taskId) },
      include: {
        faculty: true,
        thesis: true,
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if the current faculty owns this task
    if (task.faculty.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete tasks created by you",
      });
    }

    // Delete the task (submissions will be cascade deleted based on your schema)
    await db.task.delete({
      where: { id: parseInt(taskId) },
    });

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting task",
      error: error.message,
    });
  }
}

module.exports = deleteTask;
