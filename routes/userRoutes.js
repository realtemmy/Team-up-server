const express = require("express");
const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.get("/other-users", authController.protect, userController.getAllOtherUsers);


router.route("/").get(userController.getAllUsers);

router
  .route("/me")
  .get(authController.protect, userController.getCurrentUser)
  .patch(authController.protect, userController.updateUserInfo);

module.exports = router;
