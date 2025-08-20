const db = require("../../db/db");
const bcrypt = require("bcryptjs");

async function updatePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userData.userId;

    // Fetch the user with password
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Compare current password with stored hash
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update password"
    });
  }
}

module.exports = updatePassword;
