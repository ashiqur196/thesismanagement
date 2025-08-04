const bcrypt = require("bcryptjs");
const db = require("../../db/db");
require("dotenv").config();

async function register(req, res) {
  try {
    // 1. Validate input
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password || !role || !department) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2. Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user and related record in a transaction
    const result = await db.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
        },
      });

      // Create student or faculty record based on role
      if (role === "STUDENT") {
        await prisma.student.create({
          data: {
            userId: user.id,
            name,
            department,
          },
        });
      } else if (role === "FACULTY") {
        await prisma.faculty.create({
          data: {
            userId: user.id,
            name,
            department,
          },
        });
      }

      return user;
    });

    // 5. Prepare user data for response (without password)
    const userData = {
      id: result.id,
      email: result.email,
      role: result.role,
      name,
      department,
    };

    // 6. Send success response
    return res.status(201).json({
      success: true,
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = register;