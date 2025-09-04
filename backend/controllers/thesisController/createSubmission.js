// createSubmission.js
const db = require("../../db/db");

async function createSubmission(req, res) {
  try {
    console.log(req)
    const { taskId, content } = req.body;
    const userId = req.userData.userId;
    const userRole = req.userData.role;

    // Authorization check - only students can create submissions
    if (userRole !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message: "Only students can create submissions",
      });
    }

    // Validate that either content or file is provided
    if (!content && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Either content or file is required for submission",
      });
    }

    // Validate that taskId is provided for task submissions
    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required for submission",
      });
    }

    // Get student information
    const student = await db.student.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Validate task and check if student is part of the thesis
    const task = await db.task.findUnique({
      where: { id: parseInt(taskId) },
      include: {
        thesis: {
          include: {
            members: {
              where: { studentId: student.id },
            },
          },
        },
        faculty: true,
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (task.thesis.members.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this thesis",
      });
    }

    // Prepare submission data
    const submissionData = {
      studentId: student.id,
      taskId: parseInt(taskId),
      content: content || null,
      fileUrl: req.file ? req.file.filename : null,
    };

    // Create the submission
    const submission = await db.submission.create({
      data: submissionData,
      include: {
        task: {
          include: {
            thesis: {
              select: {
                id: true,
                title: true,
              },
            },
            faculty: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    // Update task status to COMPLETED if it was IN_PROGRESS
    if (task.status === "PENDING") {
      await db.task.update({
        where: { id: parseInt(taskId) },
        data: { status: "COMPLETED" },
      });
    }

    // Create notification for the faculty
    await db.notification.create({
      data: {
        userId: task.faculty.userId,
        thesisId: task.thesisId,
        type: "SUBMISSION_FEEDBACK",
        title: "New Submission Received",
        message: `Student ${student.name} has submitted work for task "${task.title}"`,
        relatedId: submission.id,
      },
    });

    // Format the response with proper file URL
    const responseData = {
      ...submission,
      fileUrl: submission.fileUrl ? `/documents/${submission.fileUrl}` : null,
    };

    res.status(201).json({
      success: true,
      message: "Submission created successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error creating submission:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating submission",
      error: error.message,
    });
  }
}

module.exports = createSubmission;
