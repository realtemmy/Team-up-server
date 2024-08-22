const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION, shutting down");
  console.log(err.name, err.message, err.stack);
  process.exit();
});

const app = require("./app");
dotenv.config({path: "./config.env" })

const DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB, console.log("Connected to database!"));

mongoose.connection.on("error", (err) => {
  console.log("error: ", err);
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});

// All async uncaught error
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message, err);
  console.log("UNHANDLED REJECTION, shutting down");
  server.close(() => {
    process.exit();
  });
});
