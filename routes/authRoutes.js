import express from "express";
import { validateSignup, validateSignin } from "../middlewares/authMiddleware.js";
import { signup, signin, forgotPassword, changePassword, resetPassword, updateProfile } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { mustBeAdmin } from "../middlewares/authorization.js";

export const authRouter = express.Router();


// Public Routes
authRouter.post("/signup", signup);
authRouter.post("/signin", [validateSignin], signin);

authRouter.post("/change-password", verifyToken, changePassword);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
// authRouter.put("/profile", verifyToken, updateProfile);
