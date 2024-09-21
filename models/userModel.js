const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    photo: {
      type: String,
      validate: [validator.isMobilePhone, "Please provide a valid phone number"]
    },
    confirmPassword: {
      type: String,
      required: [true, "Confirm password is required"],
    },
    bio: {
      type: String,
    },
    phone: {
      type: String,
    },
    projects: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Project",
      },
    ],
    education: [
      {
        school: {
          type: String,
        },
        degree: {
          type: String,
        },
        startDate: {
          type: Date,
        },
        // start and end time stamp
        // status: "ongoing/completed"
      },
    ],
    certifications: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Certificate",
      },
    ],
  },
  // {
  //   toJSON: { virtuals: true },
  //   toObject: { virtuals: true },
  // }
);

userSchema.pre("save", async function (next) {
  // only run this middleware when password field changes
  if (!this.isModified("password")) {
    return next();
  }
  // encrypt password an save
  this.password = await bcrypt.hash(this.password, 10);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.comparePasswords = async function (
  password,
  encryptedPassword
) {
  return await bcrypt.compare(password, encryptedPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;

// Bio, description, work experience, projects etc
