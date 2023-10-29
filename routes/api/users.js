const express = require("express");
const router = express.Router();
const usersController = require("../../controllers/usersController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/")
  .get(verifyRoles(ROLES_LIST.Admin), usersController.getAllUsers)
  .delete(verifyRoles(ROLES_LIST.Admin), usersController.deleteUser)
  .patch(verifyRoles(ROLES_LIST.Admin), usersController.addAdmin);

router
  .route("/:id")
  .get(verifyRoles(ROLES_LIST.Admin), usersController.getUser);

router
  .route("/removeAdmin")
  .patch(verifyRoles(ROLES_LIST.Admin), usersController.removeAdmin);

router
  .route("/apartments")
  .post(verifyRoles(ROLES_LIST.Admin), usersController.addApartment)
  .patch(verifyRoles(ROLES_LIST.Admin), usersController.addReservation);

router
  .route("/apartments/delete")
  .patch(verifyRoles(ROLES_LIST.Admin), usersController.deleteApartment);

router
  .route("/reservation")
  .patch(verifyRoles(ROLES_LIST.Admin), usersController.mutateReservation);

router
  .route("/deleteReservation")
  .patch(verifyRoles(ROLES_LIST.Admin), usersController.deleteReservation);

module.exports = router;
