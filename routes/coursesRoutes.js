import express from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getUsersWhoAreTeachers
} from "../controllers/coursesController.js"; // ✅ make sure the path is correct

import { verifyJWT } from "../middlewares/jwt.js"; // optional JWT middleware

export const courseRouter = express.Router();
courseRouter.use(verifyJWT); // optional: apply JWT verification to all routes

// CRUD Routes
courseRouter.post("/", createCourse);                  // Create a course
courseRouter.get("/teachers",getUsersWhoAreTeachers)
courseRouter.get("/", getAllCourses);                 // Get all courses
courseRouter.get("/:courseId", getCourseById);        // Get course by ID
courseRouter.put("/:courseId", updateCourse);         // Update course
courseRouter.delete("/:courseId", deleteCourse);      // Delete course
  