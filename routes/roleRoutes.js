import express from 'express';
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole
} from '../controllers/roleController';
import { verify } from 'jsonwebtoken';
import { verifyJWT } from '../middlewares/jwt';

export const roleRouter = express.Router();
roleRouter.use(verifyJWT);
// CRUD Routes

roleRouter.get("/", getAllRoles);
roleRouter.get("/:id", getRoleById);
roleRouter.post("/", createRole);
roleRouter.put("/:id", updateRole);
roleRouter.delete("/:id", deleteRole);
