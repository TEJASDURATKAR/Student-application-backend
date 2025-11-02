import Customer from "../models/Customer";
import response from "../const/response.js";
import { HTTP_MESSAGES } from "../const/message.js";
import bcrypt from 'bcrypt'
import User from "../models/User.js";

import { generateTempPassword } from "../utils/tempPassword.js";
import { sendMail } from "../utils/sendEmail.js";



// Create Customer
export const createCustomer = async (req, res) => {
  try {
    // Extract customer & user fields from request
    const {
      companyName,
      companyEmail,
      phone,
      CompanyAddress,
      city,
      state,
      is_active,
      username,
      full_name,
      email,
      roles
    } = req.body;

    // Create Customer
    const customer = await Customer.create({
      companyName,
      companyEmail,
      phone,
      CompanyAddress,
      city,
      state,
      is_active
    });

    // Create User linked to this customer
    const temppassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(temppassword, 10);

    const user = await User.create({
      username,
      full_name,
      email,
      role_id: roles,
      customer_id: customer.customer_id,
      password_hash: hashedPassword
    });

    // Send email with credentials
    const message = `Hello,\nYour username: ${username}\nYour password: ${temppassword}\nKeep it safe!`;
    await sendMail(email, "Your Account Credentials", message);

    return response.successResponse(res, 200, { customer, user }, HTTP_MESSAGES.EN.DATA_ADDED_SUCCESS);

  } catch (error) {
    console.error("Create Customer & User Error:", error);
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

// Get All Customers
export const  getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.status(200).json(customers);
    response.successResponse(res, 200, {}, HTTP_MESSAGES.EN.DATA_FETCH_SUCCESS);
  } catch (error) {
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

// Get Customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return response.errorMessageResponse(res, 404, {}, HTTP_MESSAGES.EN.USER_NOT_FOUND);
    res.status(200).json(customer);
    return response.successResponse(res, 200, {}, HTTP_MESSAGES.EN.DATA_ADDED_SUCCESS);
  } catch (error) {
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

// Update Customer
export const updateCustomer = async (req, res) => {
  try {
    const [updated] = await Customer.update(req.body, {
      where: { customer_id: req.params.id }
    });
    if (!updated) return response.errorMessageResponse(res, 404, {}, HTTP_MESSAGES.EN.USER_NOT_FOUND);
    const updatedCustomer = await Customer.findByPk(req.params.id);
    res.status(200).json(updatedCustomer);
  } catch (error) {
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

// Delete Customers
export const deleteCustomer = async (req, res) => {
  try {
    const deleted = await Customer.destroy({
      where: { customer_id: req.params.id }
    });
    if (!deleted) return response.errorMessageResponse(res, 404, {}, HTTP_MESSAGES.EN.USER_NOT_FOUND);
    return response.successResponse(res, 200, {}, HTTP_MESSAGES.EN.DATA_DELETED_SUCCESS);
  } catch (error) {
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};
