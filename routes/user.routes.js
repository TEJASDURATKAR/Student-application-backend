import multer from "multer";
import express from "express";
import { verifyJWT } from "../middlewares/jwt.js";
import { storage } from "../config/multer.config.js";
import {
  login,
  addUser,
  deleteUser,
  getAllUsers,
  updateUser,
  getUserById,
} from "../controllers/user.controller.js";

// Multer configuration
const upload = multer({ storage });

export const userRouter = express.Router();

// Public route
// userRouter.post("/login", login);

// All routes below require JWT authentication
userRouter.use(verifyJWT);

userRouter.post("/addUser", addUser);
userRouter.get("/getAllUsers", getAllUsers);
userRouter.get("/getUserById/:id", getUserById);
userRouter.put("/updateUser/:id", updateUser);
userRouter.delete("/deleteUser/:id", deleteUser);



// userRouter.post("/forget-password", forgetPassword)
// userRouter.post("/reset-VerifyOtp", resetVerifyOtp)
// userRouter.post("/verify-otp", verifyOTP)
// userRouter.post("/change-password", changePassword)
// userRouter.post("/reset-password", resetPassword)


// other routes come below verifyJwt which are not global