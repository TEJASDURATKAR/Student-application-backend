import express from "express";
import {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
} from "../controllers/batchesController.js";
import { verifyJWT } from "../middlewares/jwt.js";

// Apply JWT middleware to all batch routes
export const batchesRouter = express.Router();
batchesRouter.use(verifyJWT);

// CRUD Routes
batchesRouter.post("/", createBatch);
batchesRouter.get("/", getAllBatches);
batchesRouter.get("/:batchId", getBatchById);
batchesRouter.put("/:batchId", updateBatch);
batchesRouter.delete("/:batchId", deleteBatch);

export default batchesRouter;
