const db = require("../../db/db");

async function getProfile(req, res) {
  try {

    const user = await db.user.findUnique({
      where: { id: req.userData.userId },
      include: {
        student: true,
        faculty: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const profileData = {
      ...user,
      ...(user.student || user.faculty),
    };

    res.json({ success: true, data: profileData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}


module.exports = getProfile;