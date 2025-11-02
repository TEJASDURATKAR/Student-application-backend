import express from "express";
import {
  createInstallment,
  getAllInstallments,
  getInstallmentById,
  updateInstallment,
  deleteInstallment,
} from "../controllers/installmentController.js";

import { verifyJWT } from "../middlewares/jwt.js"; // ✅ must be defined

export const installmentRouter = express.Router();

// ✅ Protect all routes
installmentRouter.use(verifyJWT);

installmentRouter.post("/", createInstallment);
installmentRouter.get("/", getAllInstallments);
installmentRouter.get("/:id", getInstallmentById);
installmentRouter.put("/:id", updateInstallment);
installmentRouter.delete("/:id", deleteInstallment);

export default installmentRouter;
