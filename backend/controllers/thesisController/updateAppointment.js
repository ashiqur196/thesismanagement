// updateAppointment.js
const db = require("../../db/db");

async function updateAppointment(req, res) {
  try {
    const { appointmentId } = req.params;
    const { status, time } = req.body;
    const userId = req.userData.userId;

    // Validate required fields
    if (!appointmentId || !status) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID and status are required",
      });
    }

    // Check if the user is the faculty member who can update the appointment
    const appointment = await db.appointment.findUnique({
      where: { id: parseInt(appointmentId) },
      include: {
        thesis: {
          include: {
            supervisor: {
              include: {
                user: true,
              },
            },
          },
        },
        faculty: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check if the user is the supervisor of the thesis
    if (
      !appointment.thesis.supervisor ||
      appointment.thesis.supervisor.userId !== userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You must be the supervisor of this thesis to update appointments",
      });
    }

    // Update the appointment
    const updatedAppointment = await db.appointment.update({
      where: { id: parseInt(appointmentId) },
      data: {
        status,
        time: time ? new Date(time) : null,
      },
    });

    // Get all students in the thesis for notification
    const thesisMembers = await db.thesisMember.findMany({
      where: { thesisId: appointment.thesisId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    // Create notifications for all students in the thesis
    const notificationPromises = thesisMembers.map((member) =>
      db.notification.create({
        data: {
          userId: member.student.userId,
          thesisId: appointment.thesisId,
          facultyId: appointment.facultyId,
          type: "APPOINTMENT",
          title: `Appointment ${status.toLowerCase()}`,
          message: `Your appointment request with ${
            appointment.faculty.name
          } for thesis "${
            appointment.thesis.title
          }" has been ${status.toLowerCase()}${
            time ? ` at ${new Date(time).toLocaleString()}` : ""
          }`,
          relatedId: updatedAppointment.id,
        },
      })
    );

    await Promise.all(notificationPromises);

    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      data: updatedAppointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating appointment",
      error: error.message,
    });
  }
}

module.exports = updateAppointment;
