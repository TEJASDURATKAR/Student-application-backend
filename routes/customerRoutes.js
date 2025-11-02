import express from 'express';
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController.js';
import { verifyJWT } from '../middlewares/jwt.js';

export const customerRouter = express.Router();


customerRouter.use(verifyJWT);
// CRUD Routes
customerRouter.post("/", createCustomer);
customerRouter.get("/", getAllCustomers);
customerRouter.get("/:id", getCustomerById);
customerRouter.put("/:id", updateCustomer);
customerRouter.delete("/:id", deleteCustomer);
