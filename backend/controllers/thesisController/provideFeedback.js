// provideFeedback.js
const db = require("../../db/db");

async function provideFeedback(req, res) {
  try {
    const { submissionId } = req.params;
    const { feedback, grade } = req.body;
    const userId = req.userData.userId;
    const userRole = req.userData.role;

    // Authorization check - only faculty can provide feedback
    if (userRole !== "FACULTY") {
      return res.status(403).json({
        success: false,
        message: "Only faculty can provide feedback",
      });
    }

    // Validate submission ID
    if (!submissionId) {
      return res.status(400).json({
        success: false,
        message: "Submission ID is required",
      });
    }

    // Find the submission with task and faculty information
    const submission = await db.submission.findUnique({
      where: { id: parseInt(submissionId) },
      include: {
        task: {
          include: {
            faculty: true,
            thesis: true,
          },
        },
        student: true,
      },
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Check if the current faculty is the task creator
    if (!submission.task || submission.task.faculty.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only provide feedback on submissions for your tasks",
      });
    }

    // Update the submission with feedback
    const updatedSubmission = await db.submission.update({
      where: { id: parseInt(submissionId) },
      data: {
        feedback: feedback || null,
        grade: grade !== undefined ? parseInt(grade) : null,
      },
      include: {
        task: {
          include: {
            thesis: {
              select: {
                id: true,
                title: true,
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

    // Create notification for the student
    await db.notification.create({
      data: {
        userId: submission.student.userId,
        facultyId: submission.task.faculty.id,
        thesisId: submission.task.thesisId,
        type: "SUBMISSION_FEEDBACK",
        title: "Feedback Received",
        message: `You have received feedback on your submission for task "${submission.task.title}"`,
        relatedId: submission.id,
      },
    });

    res.json({
      success: true,
      message: "Feedback provided successfully",
      data: updatedSubmission,
    });
  } catch (error) {
    console.error("Error providing feedback:", error);
    res.status(500).json({
      success: false,
      message: "Server error while providing feedback",
      error: error.message,
    });
  }
}

module.exports = provideFeedback;
