const mongoose = require("mongoose");
const validator = require("validator");

const certificateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Certificate's name should not be empty"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Certificate must belong to a user"],
    },
    url: {
      type: String,
      validate: [validator.isURL, "Please provide a valid url"],
      required: [true, "Please submit link to certification"],
    },
    issuingOrganization: {
      type: String,
      required: [true, "Issuing organization is yet to be filled"],
    },
    issuedDate: {
      type: Date,
      required: [true, "Please enter an issued date for the certificate"],
    },
  },
  {
    timestamps: true,
  }
);

const Certificate = mongoose.model("Certificate", certificateSchema);

module.exports = Certificate;
