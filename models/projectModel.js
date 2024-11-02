const mongoose = require("mongoose");
const validator = require("validator");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A project must have a name"],
      unique: true,
    },
    desc: {
      type: String,
      required: [true, "A project must have a description"],
    },
    skills: [{ type: String }],
    skillLevel: {
      type: String,
    },
    type: {
      type: String,
      required: [true, "Project must belong to a type"],
    },
    summary: {
      type: String,
      maxLength: [50, "Summary should be less than 50 characters"],
      required: [
        true,
        "A project should have a summary explaining the basic idea of the project",
      ],
    },
    status: {
      type: String,
      default: "ongoing",
      enum: ["ongoing", "completed", "paused"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A project must have an owner"],
    },
    links: {
      repoUrl: {
        type: String,
        validate: [validator.isURL, "Please enter a valid URL"],
        required: [true, "Please enter a URL"]
      },
      liveUrl: {
        type: String,
        validate: [validator.isURL, "Please enter a valid URL"],
        required: [true, "Please enter a URL"],
      },
    },

    contributors: [
      {
        type: String,
        validate: [validator.isEmail, "Please enter a valid email"],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
