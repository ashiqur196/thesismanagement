const db = require("../../db/db");

async function getThesisMembers(req, res) {
  try {
    const { thesisId } = req.params;

    // Validate thesisId parameter
    if (!thesisId || isNaN(parseInt(thesisId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid thesis ID"
      });
    }

    const thesisIdInt = parseInt(thesisId);

    // Fetch the thesis with members and supervisor in a single query
    const thesis = await db.thesis.findUnique({
      where: {
        id: thesisIdInt
      },
      include: {
        members: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    email: true,
                    image: true
                  }
                }
              }
            }
          }
        },
        supervisor: {
          include: {
            user: {
              select: {
                email: true,
                image: true
              }
            }
          }
        }
      }
    });

    // Check if thesis exists
    if (!thesis) {
      return res.status(404).json({
        success: false,
        message: "Thesis not found"
      });
    }

    // Format student members
    const students = thesis.members.map(member => ({
      id: member.student.id,
      name: member.student.name,
      image: member.student.user.image,
      email: member.student.user.email,
      userId: member.student.userId,
      creator:member.creator,
      joinedAt: member.joinedAt
    }));

    // Format supervisor (null if not exists)
    const supervisor = thesis.supervisor ? {
      id: thesis.supervisor.id,
      name: thesis.supervisor.name,
      image: thesis.supervisor.user.image,
      email: thesis.supervisor.user.email,
      userId: thesis.supervisor.userId
    } : null;

    res.json({
      success: true,
      data: {
        students,
        supervisor
      }
    });

  } catch (error) {
    console.error("Error fetching thesis members:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching thesis members",
      error: error.message
    });
  }
}

module.exports = getThesisMembers;