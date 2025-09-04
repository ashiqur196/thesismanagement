const db = require("../../db/db");

async function updateSupervisionRequest(req, res) {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const userId = req.userData.userId;
    const userRole = req.userData.role;

    // Validate request ID
    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "Request ID is required",
      });
    }

    // Find the request with thesis information to check sender
    const request = await db.supervisorRequest.findUnique({
      where: { id: parseInt(requestId) },
      include: {
        faculty: {
          include: {
            user: true,
          },
        },
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

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Check if the current user is the sender (student who created the thesis)
    const isSender = request.thesis.members.some(
      (member) => member.student.userId === userId && member.creator === true
    );

    // Authorization check
    if (userRole === "FACULTY") {
      // Faculty can only update requests sent to them
      if (request.faculty.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: "You can only update requests sent to you",
        });
      }

      // Validate status for faculty (only ACCEPTED or REJECTED)
      const validFacultyStatuses = ["ACCEPTED", "REJECTED"];
      if (!status || !validFacultyStatuses.includes(status.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: "Faculty must provide status: ACCEPTED or REJECTED",
        });
      }

      // Update the request status
      const updatedRequest = await db.supervisorRequest.update({
        where: { id: parseInt(requestId) },
        data: { status: status.toUpperCase() },
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
              department: true,
            },
          },
        },
      });

      // If faculty accepts the request, update the thesis supervisor
      if (status.toUpperCase() === "ACCEPTED") {
        await db.thesis.update({
          where: { id: request.thesisId },
          data: {
            supervisorId: request.facultyId,
            status: "ACTIVE",
          },
        });

        // Create notification for the student (thesis creator)
        const thesisCreator = request.thesis.members.find(
          (member) => member.creator === true
        );
        if (thesisCreator) {
          await db.notification.create({
            data: {
              userId: thesisCreator.student.userId,
              facultyId: request.facultyId,
              thesisId: request.thesisId,
              type: "SUPERVISOR_REQUEST",
              title: "Supervisor Request Accepted",
              message: `Professor ${request.faculty.name} has accepted your supervisor request for thesis "${request.thesis.title}"`,
              relatedId: request.id,
            },
          });
        }
      }

      // If faculty rejects the request, create notification
      if (status.toUpperCase() === "REJECTED") {
        const thesisCreator = request.thesis.members.find(
          (member) => member.creator === true
        );
        if (thesisCreator) {
          await db.notification.create({
            data: {
              userId: thesisCreator.student.userId,
              facultyId: request.facultyId,
              thesisId: request.thesisId,
              type: "SUPERVISOR_REQUEST",
              title: "Supervisor Request Rejected",
              message: `Professor ${request.faculty.name} has rejected your supervisor request for thesis "${request.thesis.title}"`,
              relatedId: request.id,
            },
          });
        }
      }

      res.json({
        success: true,
        message: `Request ${status.toLowerCase()} successfully`,
        data: updatedRequest,
      });
    } else if (userRole === "STUDENT") {
      // Students can only delete requests they sent (thesis creator)
      if (!isSender) {
        return res.status(403).json({
          success: false,
          message: "Only the thesis creator can delete request",
        });
      }

      if (status !== "DELETED"){
        return res.status(403).json({
          success: false,
          message: "Invalid status. You can only delete requests",
        });
      }

      // Students can only delete PENDING requests
      if (request.status !== "PENDING") {
        return res.status(400).json({
          success: false,
          message: "You can only delete pending requests",
        });
      }

      // Delete the request
      await db.supervisorRequest.delete({
        where: { id: parseInt(requestId) },
      });


      res.json({
        success: true,
        message: "Request deleted successfully",
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "Only students and faculty can update requests",
      });
    }
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating request",
      error: error.message,
    });
  }
}

module.exports = updateSupervisionRequest;
