// createAppointment.js
const db = require("../../db/db");

async function createAppointment(req, res) {
  try {
    const { thesisId, message } = req.body;
    const userId = req.userData.userId;

    // Validate required fields
    if (!thesisId || !message) {
      return res.status(400).json({
        success: false,
        message: "Thesis ID and message are required",
      });
    }

    // First, get the student record for this user
    const student = await db.student.findUnique({
      where: { userId: userId },
      include: {
        user: true, // Include user data for the notification
      },
    });

    if (!student) {
      return res.status(403).json({
        success: false,
        message: "Only students can request appointments",
      });
    }

    // Check if the user is a member of the thesis
    const member = await db.thesisMember.findFirst({
      where: {
        studentId: student.id,
        thesisId: parseInt(thesisId),
      },
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message:
          "You must be a member of this thesis to request an appointment",
      });
    }

    // Check if the thesis is active and get supervisor info
    const thesis = await db.thesis.findUnique({
      where: { id: parseInt(thesisId) },
      include: {
        supervisor: {
          include: {
            user: true, // Include faculty user data for notification
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

    if (thesis.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Thesis must be active to request an appointment",
      });
    }

    if (!thesis.supervisor) {
      return res.status(403).json({
        success: false,
        message: "Thesis must have a supervisor to request an appointment",
      });
    }

    // Create the appointment
    const appointment = await db.appointment.create({
      data: {
        thesisId: parseInt(thesisId),
        facultyId: thesis.supervisor.id,
        message,
        status: "PENDING", // Initial status is PENDING
      },
    });

    // Create a notification for the faculty
    await db.notification.create({
      data: {
        userId: thesis.supervisor.userId,
        facultyId: thesis.supervisor.id,
        thesisId: parseInt(thesisId),
        type: "APPOINTMENT",
        title: "New Appointment Request",
        message: `A new appointment request has been made by ${student.name} for thesis "${thesis.title}"`,
        relatedId: appointment.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Appointment request created successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating appointment",
      error: error.message,
    });
  }
}

module.exports = createAppointment;
