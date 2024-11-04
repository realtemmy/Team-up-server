const mongoose = require("mongoose");
const slugify = require("slugify");
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
        required: [true, "Please enter a URL"],
      },
      liveUrl: {
        type: String,
        validate: [validator.isURL, "Please enter a valid URL"],
        required: [true, "Please enter a URL"],
      },
    },
    slug: {
      type: String,
    },
    contributors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    requests: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId },
        requestedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

projectSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
