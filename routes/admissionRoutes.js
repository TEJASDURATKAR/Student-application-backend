import express from "express";
import {
  createAdmission,
  getAllAdmissions,
  getAdmissionById,
  updateAdmission,
  deleteAdmission,
} from "../controllers/admissionController.js";
import { verifyJWT } from "../middlewares/jwt.js";

// Apply JWT middleware to all admission routes
export const admissionRouter = express.Router();
admissionRouter.use(verifyJWT);

// CRUD Routes
admissionRouter.post("/", createAdmission);
admissionRouter.get("/", getAllAdmissions);
admissionRouter.get("/:admissionId", getAdmissionById);
admissionRouter.put("/:admissionId", updateAdmission);
admissionRouter.delete("/:admissionId", deleteAdmission);

export default admissionRouter;
