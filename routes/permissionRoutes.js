import express from "express";
import {
  createPermission,
  getAllPermissions,
  getPermissionById,
  updatePermission,
  deletePermission,
} from "../controllers/permissionController.js";
import { verifyJWT } from "../middlewares/jwt.js";

export const permissionRouter = express.Router();

// ✅ Apply JWT middleware for all permission routes
permissionRouter.use(verifyJWT);

// ✅ CRUD Routes
permissionRouter.get("/", getAllPermissions);
permissionRouter.get("/:id", getPermissionById);
permissionRouter.post("/", createPermission);
permissionRouter.put("/:id", updatePermission);
permissionRouter.delete("/:id", deletePermission);
