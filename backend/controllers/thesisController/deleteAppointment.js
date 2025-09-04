const db = require("../../db/db");

async function deleteAppointment(req, res) {
  try {
    const { appointmentId } = req.params;
    const userId = req.userData.userId;

    // Validate required fields
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    // Check if the appointment exists and get related data
    const appointment = await db.appointment.findUnique({
      where: { id: parseInt(appointmentId) },
      include: {
        thesis: {
          include: {
            members: {
              include: {
                student: {
                  include: {
                    user: true,
                  },
                },
              },
            },
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

    // Check if the user is a student member of this thesis
    const userIsThesisMember = appointment.thesis.members.some(
      (member) => member.student.userId === userId
    );

    if (!userIsThesisMember) {
      return res.status(403).json({
        success: false,
        message: "Only thesis members can delete appointments",
      });
    }

    // Delete the appointment
    await db.appointment.delete({
      where: { id: parseInt(appointmentId) },
    });

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting appointment",
      error: error.message,
    });
  }
}

module.exports = deleteAppointment;
