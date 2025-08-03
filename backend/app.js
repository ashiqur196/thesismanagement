const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());

const authRoute = require("./routes/auth");
// const adminRoute = require("./routes/admin");
// const studentRoute = require("./routes/student");
// const facultyRoute = require("./routes/faculty");

app.use(bodyParser.json());

app.use("/auth", authRoute);
// app.use("/student", studentRoute);
// app.use("/faculty", facultyRoute);
// app.use("/admin", adminRoute);


module.exports = app;