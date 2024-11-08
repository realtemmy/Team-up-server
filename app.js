const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require('./utils/appError');

const app = express();

dotenv.config({ path: "./config.env" });

app.use(cors());
app.use(express.json());

// password select false not working
// validation after password update


// =============== Routes ======================

const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");


app.use("/api/v1/user", userRoutes);
app.use("/api/v1/project", projectRoutes);
app.use("/api/v1/certificate", certificateRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/comments", commentRoutes)


// ================ All undefined routes ================= //
app.use("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// ============== Global error handler ============== //
app.use(globalErrorHandler);

module.exports = app;
