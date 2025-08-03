const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../db/db"); // Assuming this exports a PrismaClient instance
require("dotenv").config();

async function login(req, res) {
  try {
    // 1. Validate input
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. Find user using Prisma
    const user = await db.user.findUnique({
      where: { email },
      include: {
        student: true,
        faculty: true,
      },
    });

    // 3. Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 4. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 5. Prepare user data for token
    const userData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.role === "STUDENT" ? user.student?.name : user.faculty?.name,
    };

    // 6. Generate token
    const token = jwt.sign(
      userData,
      process.env.JWT_KEY,
      { expiresIn: "7d" } // Token expiration
    );

    // 7. Send success response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: userData.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = login;
