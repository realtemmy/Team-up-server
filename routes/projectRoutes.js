const express = require("express");
const authController = require("./../controllers/authController");
const projectController = require("./../controllers/projectController");

const router = express.Router();

router
  .route("/")
  .get(projectController.getAllprojects)
  .post(
    authController.protect,
    projectController.createProject
  );

router
  .route("/:id")
  .get(projectController.getProject)
  .patch(
    authController.protect,
    projectController.canPerformActionOnproject,
    projectController.uploadProjectPhoto,
    projectController.uploadProjectToCloudinary,
    projectController.updateProject
  )
  .delete(
    authController.protect,
    projectController.canPerformActionOnproject,
    projectController.deleteProject
  );

module.exports = router;
