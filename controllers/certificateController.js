const asyncHandler = require("express-async-handler");
const Certificate = require("./../models/certificateModel");
const AppError = require("../utils/appError");
const User = require("./../models/userModel");

exports.getAllCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find();
  res.status(200).json({
    status: "success",
    data: certificates,
  });
});

exports.getAllUserCertificate = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ user: req.user.id });
  res.status(200).json({
    status: "success",
    data: certificates,
  });
});

exports.createCertificate = asyncHandler(async (req, res) => {
  const { name, issuedDate, url, issuingOrganization } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("No User found", 404));
  }
  const certificate = await Certificate.create({
    name,
    issuedDate,
    url,
    user: req.user.id,
    issuingOrganization,
  });
  user.certifications.push(certificate._id);
  await user.save({ validateBeforeSave: false });
  res.status(201).json({
    status: "success",
    data: certificate,
  });
});

exports.getCertificate = asyncHandler(async (req, res, next) => {
  const cert = await Certificate.findById(req.params.id);
  if (!cert) {
    return next(new AppError("No certificate with ID found", 404));
  }
  res.status(200).json({
    status: "success",
    data: cert,
  });
});

exports.updateCertificate = asyncHandler(async (req, res, next) => {
  // only owner should be able to update and delete
  const updatedCert = await Certificate.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!updatedCert) {
    return next(new AppError("No certificate with ID found", 404));
  }
  res.status(200).json({
    status: "success",
    data: updatedCert,
  });
});

exports.canPerformActionOnCertificate = asyncHandler(async (req, res, next) => {
  // check if ID of certificate matches that of the logged in user about to perform an action
  const cert = await Certificate.findById(req.params.id);
  if (!cert.user.equals(req.user.id)) {
    return next(
      new AppError(
        "Only the creator of certificate can perform this action",
        403
      )
    );
  }
  next();
});

exports.deleteCertificate = asyncHandler(async (req, res) => {
  await Certificate.findByIdAndDelete(req.params.id);
  res.status(204).json({
    stataus: "success",
    data: null,
  });
});
