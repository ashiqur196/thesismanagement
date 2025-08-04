const jwt = require("jsonwebtoken");
const db = require("../../db/db");
require("dotenv").config();

async function checkToken(req, res) {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    // 3. Find user in database
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      include: {
        student: true,
        faculty: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 4. Prepare user data for response
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      image: user.image,
      name: user.role === "STUDENT" ? user.student?.name : user.faculty?.name,
      department: user.role === "STUDENT" ? user.student?.department : user.faculty?.department,
    };

    // 5. Send success response
    return res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Token verification error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = checkToken;