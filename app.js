const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require('./utils/appError');

const app = express();

dotenv.config({ path: "./config.env" });

app.use(cors());
app.use(express.json());


// =============== Routes ======================

const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const certificateRoutes = require("./routes/certificateRoutes");


app.use("/api/v1/user", userRoutes);
app.use("/api/v1/project", projectRoutes);
app.use("/api/v1/certificate", certificateRoutes);


// ================ All undefined routes ================= //
app.use("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// ============== Global error handler ============== //
app.use(globalErrorHandler);

module.exports = app;
