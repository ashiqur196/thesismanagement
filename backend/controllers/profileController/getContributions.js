const db = require("../../db/db");

async function getContributions(req, res){
  try{

    const userId = parseInt(req.query.id);

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        faculty: true,
      },
    });

    if(!user){
      res.status(404).json({success: false, message: "No user found"});
    }

    let contributions;
    if (user.role === 'STUDENT') {
      contributions = await db.contribution.findMany({
        where: { studentId: parseInt(user.student.id) }
      });
    } else if (user.role === 'FACULTY') {
      contributions = await db.contribution.findMany({
        where: { facultyId: parseInt(user.faculty.id) }
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    res.json({ success: true, data: contributions });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = getContributions;