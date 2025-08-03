const bcrypt = require("bcryptjs");
const db = require("../../db/db"); // Prisma client

async function register(req, res) {
  try {
    // 1. Check required fields
    const { name, email, department, password, role } = req.body;

    if (!name || !email || !department || !password || !role) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (name, email, department, password, role) are required",
      });
    }

    // 2. Validate role
    if (!["STUDENT", "FACULTY"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role (must be STUDENT or FACULTY)",
      });
    }

    // 3. Check if email exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Create user and profile
    await db.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
        },
      });

      const profileData = {
        name,
        department,
        userId: user.id,
      };

      if (role === "STUDENT") {
        await prisma.student.create({
          data: profileData,
        });
      } else {
        await prisma.faculty.create({
          data: {
            ...profileData,
            available_slot: 0, // Default for faculty
          },
        });
      }
    });

    // 6. Success response (no token)
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
