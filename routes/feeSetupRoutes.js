// routes/feeSetupRoutes.js
import express from "express";
import {
  createFeeSetup,
  getAllFeeSetups,
  getFeeSetupById,
  updateFeeSetup,
  deleteFeeSetup,
} from "../controllers/feeSetupController.js";
import { verifyJWT } from "../middlewares/jwt.js"; // ✅ must be defined

export const feeSetupRouter = express.Router();

// ✅ Protect all routes
feeSetupRouter.use(verifyJWT);

// ✅ CRUD routes
feeSetupRouter.post("/", createFeeSetup);
feeSetupRouter.get("/", getAllFeeSetups);
feeSetupRouter.get("/:id", getFeeSetupById);
feeSetupRouter.put("/:id", updateFeeSetup);
feeSetupRouter.delete("/:id", deleteFeeSetup);

export default feeSetupRouter;
