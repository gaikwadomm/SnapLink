import { Router } from "express";
import {
  loginUser,
  changeCurrentPassword,
  registerUser,
  logoutUser,
  refreshAccessToken,
  deleteAccount,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken);

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/delete-account").delete(verifyJWT, deleteAccount)


export default router

