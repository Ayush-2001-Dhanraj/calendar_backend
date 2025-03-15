import express from "express";
const router = express.Router();

import { login, register, loginFailed, logout } from "../controller/auth.js";
import {
  deleteUser,
  getUser,
  updateUserDetails,
  getCurrentUser,
} from "../controller/user.js";
import {
  createEvent,
  getEvent,
  getAllUserEvents,
  deleteEvent,
  updateEvent,
} from "../controller/event.js";
import passport from "passport";

router
  .route("/auth/login")
  .get(loginFailed)
  .post(
    passport.authenticate("local", {
      failureRedirect: "/api/v1/auth/login",
    }),
    login
  );
router.route("/auth/register").post(register);
router.route("/auth/logout").get(logout);

router.route("/user").get(getCurrentUser);

router
  .route("/user/:userID")
  .get(getUser)
  .put(updateUserDetails)
  .delete(deleteUser)
  .post(createEvent);

router.route("/user/:userID/events").get(getAllUserEvents);

router
  .route("/event/:eventID")
  .get(getEvent)
  .delete(deleteEvent)
  .put(updateEvent);

export default router;
