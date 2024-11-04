const express = require("express");
const authController = require("./../controllers/authController");
const projectController = require("./../controllers/projectController");

const router = express.Router();

router
  .route("/")
  .get(projectController.getAllprojects)
  .post(authController.protect, projectController.createProject);

router.get("/user", authController.protect, projectController.getAllUserProjects);

router
  .route("/:id")
  .get(projectController.getProject)
  .patch(
    authController.protect,
    projectController.canPerformActionOnproject,
    // projectController.uploadProjectPhoto,
    // projectController.uploadProjectToCloudinary,
    projectController.updateProject
  )
  .delete(
    authController.protect,
    projectController.canPerformActionOnproject,
    projectController.deleteProject
  );

// router.get(
//   "/user",
//   authController.protect,
//   projectController.getAllUserProjects
// );

router.patch(
  "/:id/join-request",
  authController.protect,
  projectController.joinRequest
);
router.patch(
  "/:id/join-manage",
  authController.protect,
  projectController.manageRequest
);

module.exports = router;
