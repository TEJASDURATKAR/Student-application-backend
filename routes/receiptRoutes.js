import express from "express";
import {
  createReceipt,
  getAllReceipts,
  getReceiptById,
  deleteReceipt,
  downloadReceipt,
} from "../controllers/receiptController.js";
import { verifyJWT } from "../middlewares/jwt.js";


export const receiptRouter = express.Router();

// ✅ Apply JWT middleware for all receipt routes
receiptRouter.use(verifyJWT);

// Routes
receiptRouter.post("/", createReceipt);
receiptRouter.get("/", getAllReceipts);
receiptRouter.get("/:id", getReceiptById);
receiptRouter.get("/:id/download", downloadReceipt);

receiptRouter.delete("/:id", deleteReceipt);

export default receiptRouter;
