const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());

// Global delay for testing
app.use((req, res, next) => {
  const delay = 10; // 2 seconds
  setTimeout(next, delay);
});
const authRoute = require("./routes/auth");
const profileRoute = require("./routes/profile");
const staticRoute = require("./routes/static");
const thesisRoute = require("./routes/thesis");
// const adminRoute = require("./routes/admin");
// const studentRoute = require("./routes/student");
const facultyRoute = require("./routes/faculty");

app.use(bodyParser.json());
app.get("/ping", (req, res) => {
  res.status(200).send("Server is running");
});

app.use("/auth", authRoute);
app.use("/account", profileRoute);
app.use("/static", staticRoute);
app.use("/thesis", thesisRoute);
// app.use("/student", studentRoute);
app.use("/faculty", facultyRoute);
// app.use("/admin", adminRoute);


module.exports = app;