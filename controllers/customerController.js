import response from "../const/response.js";
import { HTTP_MESSAGES } from "../const/message.js";
import bcrypt from "bcrypt";

import { generateTempPassword } from "../utils/tempPassword.js";
import { sendMail } from "../utils/sendEmail.js";
import { sequelize } from "../config/db.config.js";
import models from "../models/index.js";

const { User, Role, Customer } = models;

// ✅ Create Customer + Role + User
export const createCustomer = async (req, res) => {
  const t = await sequelize.transaction();

  try {
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
      role_name,
      permission
    } = req.body;

    console.log("🟢 Step 1: Creating Customer...");
    const customer = await Customer.create(
      {
        companyName,
        companyEmail,
        phone,
        CompanyAddress,
        city,
        state,
        is_active,
      },
      { transaction: t }
    );

    console.log("🟢 Step 2: Parsing and Creating Role...");

    // ✅ Parse permission JSON if it's a string
    let parsedPermission = permission;
    if (typeof permission === "string") {
      try {
        parsedPermission = JSON.parse(permission);
      } catch (e) {
        console.error("❌ Invalid permission JSON:", e);
        throw new Error("Invalid permission format");
      }
    }

    const role = await Role.create(
      {
        role_name: role_name.trim(),
        role: role_name.trim().toLowerCase().replace(/\s+/g, "_"),
        customer_id: customer.customer_id,
        permission: parsedPermission,
      },
      { transaction: t }
    );

    console.log("🟢 Step 3: Creating User...");
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await User.create(
      {
        username,
        full_name,
        email,
        role_id: role.role_id,
        customer_id: customer.customer_id,
        password_hash: hashedPassword,
      },
      { transaction: t }
    );

    await t.commit();
    console.log("✅ Transaction Committed");

    // ✅ Send credentials via email (non-blocking)
    const message = `Hello ${full_name},\n\nYour account has been created successfully!\n\nUsername: ${username}\nPassword: ${tempPassword}\n\nPlease keep this information safe.`;
    sendMail(email, "Your Account Credentials", message).catch(console.error);

    // ✅ Fetch full data for response
    const userData = await User.findOne({
      where: { id: user.id },
      attributes: ["id", "email", "username", "full_name"],
      include: [
        { model: Role, attributes: ["role_id", "role_name", "permission"] },
        { model: Customer, attributes: ["customer_id", "companyName", "companyEmail"] },
      ],
    });

    return response.successResponse(
      res,
      200,
      { user: userData },
      HTTP_MESSAGES.EN.DATA_ADDED_SUCCESS
    );
  } catch (error) {
    await t.rollback();
    console.error("❌ Create Customer, Role & User Error:", error);
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};



// Get All Customers
// Get All Customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      include: [
        {
          model: Role,
          as: "Roles", // ✅ matches association alias
          attributes: ["role_id", "role_name", "role", "permission", "customer_id"],
        },
        {
          model: User,
          as: "Users", // ✅ matches association alias
          attributes: ["user_id", "username", "full_name", "email", "role_id", "customer_id"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const result = customers.map((customer) => {
      const role = customer.Roles?.[0]
        ? {
            ...customer.Roles[0].get(),
            permission: JSON.parse(customer.Roles[0].permission || "[]"),
          }
        : null;

      const user = customer.Users?.[0]
        ? { ...customer.Users[0].get() }
        : null;

      return {
        customer: customer.get(),
        role,
        user,
      };
    });

    return response.successResponse(
      res,
      200,
      result,
      HTTP_MESSAGES.EN.DATA_FETCH_SUCCESS
    );
  } catch (error) {
    console.error("Get All Customers Error:", error);
    return response.errorMessageResponse(
      res,
      500,
      {},
      HTTP_MESSAGES.EN.SERVER_ERROR
    );
  }
};


// Get Customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer)
      return response.errorMessageResponse(
        res,
        404,
        {},
        HTTP_MESSAGES.EN.USER_NOT_FOUND,
      );
    res.status(200).json(customer);
    return response.successResponse(
      res,
      200,
      {},
      HTTP_MESSAGES.EN.DATA_ADDED_SUCCESS,
    );
  } catch (error) {
    return response.errorMessageResponse(
      res,
      500,
      {},
      HTTP_MESSAGES.EN.SERVER_ERROR,
    );
  }
};

// Update Customer
export const updateCustomer = async (req, res) => {
  try {
    const [updated] = await Customer.update(req.body, {
      where: { customer_id: req.params.id },
    });
    if (!updated)
      return response.errorMessageResponse(
        res,
        404,
        {},
        HTTP_MESSAGES.EN.USER_NOT_FOUND,
      );
    const updatedCustomer = await Customer.findByPk(req.params.id);
    res.status(200).json(updatedCustomer);
  } catch (error) {
    return response.errorMessageResponse(
      res,
      500,
      {},
      HTTP_MESSAGES.EN.SERVER_ERROR,
    );
  }
};

// Delete Customers
export const deleteCustomer = async (req, res) => {
  try {
    const deleted = await Customer.destroy({
      where: { customer_id: req.params.id },
    });
    if (!deleted)
      return response.errorMessageResponse(
        res,
        404,
        {},
        HTTP_MESSAGES.EN.USER_NOT_FOUND,
      );
    return response.successResponse(
      res,
      200,
      {},
      HTTP_MESSAGES.EN.DATA_DELETED_SUCCESS,
    );
  } catch (error) {
    return response.errorMessageResponse(
      res,
      500,
      {},
      HTTP_MESSAGES.EN.SERVER_ERROR,
    );
  }
};
