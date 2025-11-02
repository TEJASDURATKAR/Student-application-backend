import express from "express";
import {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry,
} from "../controllers/enquiryController.js";
import { verifyJWT } from "../middlewares/jwt.js";



// Apply JWT middleware to all enquiry routes
export const enquiryRouter = express.Router();
enquiryRouter.use(verifyJWT);

// CRUD Routes
enquiryRouter.post("/", createEnquiry);
enquiryRouter.get("/", getAllEnquiries);
enquiryRouter.get("/:enquiryId", getEnquiryById);
enquiryRouter.put("/:enquiryId", updateEnquiry);
enquiryRouter.delete("/:enquiryId", deleteEnquiry);

export default enquiryRouter;
