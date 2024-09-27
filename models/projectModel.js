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
    summary: {
      type: String,
      maxLength: [50, "Summary should be less than 50 characters"],
      required: [
        true,
        "A project should have a summary explaining the basic idea of the project",
      ],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A project must have an owner"],
    },
    url: {
      type: String,
      validate: [validator.isURL, "Please enter a valid URL"],
      required: [true, "Please enter a URL"],
    },
    contributors: [{ type: mongoose.Schema.Types.ObjectId }],
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
