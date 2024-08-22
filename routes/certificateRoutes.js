const express = require("express");
const authController = require("./../controllers/authController");
const certificateController = require("./../controllers/certificateController");

const router = express.Router();

router.get("/me", authController.protect, certificateController.getAllUserCertificate);

router
  .route("/")
  .get(certificateController.getAllCertificates)
  .post(authController.protect, certificateController.createCertificate);

router
  .route("/:id")
  .get(certificateController.getCertificate)
  .patch(
    authController.protect,
    certificateController.canPerformActionOnCertificate,
    certificateController.updateCertificate
  )
  .delete(
    authController.protect,
    certificateController.canPerformActionOnCertificate,
    certificateController.deleteCertificate
  );

module.exports = router;
