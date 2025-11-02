import express from "express";
import {
  createTeacher,
  getAllTeachers,
  TeacherById,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacherController.js";   // ✅ make sure the path is correct

import { verifyJWT } from "../middlewares/jwt.js";

export const teacherRouter = express.Router();

teacherRouter.use(verifyJWT);

// CRUD Routes
teacherRouter.post("/", createTeacher);
teacherRouter.get("/", getAllTeachers);        // ✅ now this points to a real function
teacherRouter.get("/:teacherId", TeacherById);
teacherRouter.put("/:teacherId", updateTeacher);
teacherRouter.delete("/:teacherId", deleteTeacher);
