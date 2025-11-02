import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import response from "../const/response.js";
import { HTTP_MESSAGES } from "../const/message.js";
import { JWT_KEY } from "../const/credentials.js";
import models from "../models/index.js";
import nodemailer from "nodemailer";


const { User, Role, Customer,Permission } = models;

// Utility to generate a temporary password
const generateTempPassword = () => Math.random().toString(36).slice(-8);

// Email sender
const sendMail = async (to, subject, message) => {
  if (process.env.NODE_ENV === "production") {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: `"Your App" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      text: message
    });
  } else {
    console.log(`📩 Email to ${to}\nSubject: ${subject}\nMessage: ${message}`);
  }
};

// ==================== Add User ====================
export const addUser = async (req, res) => {
  try {
    const { username, full_name, email, role_id, customer_id } = req.body;

    if (!role_id) return response.errorMessageResponse(res, 400, {}, "Role ID is required");
    if (!customer_id) return response.errorMessageResponse(res, 400, {}, "Customer ID is required");

    const temppassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(temppassword, 10);

    await User.create({ username, full_name, email, password_hash: hashedPassword, role_id, customer_id });

    const message = `Hello,\nYour username: ${username}\nYour password: ${temppassword}\nKeep it safe!`;
    await sendMail(email, "Your Account Credentials", message);

    return response.successResponse(res, 200, {}, HTTP_MESSAGES.EN.DATA_ADDED_SUCCESS);
  } catch (error) {
    console.error("Add user error:", error);
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

// ==================== Login ====================
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      where: { email, is_active: true, is_deleted: false },
      attributes: { exclude: ["is_deleted", "token", "created_at", "updated_at", "is_active"] },
    });

    if (!user) return response.errorResponse(res, 404, {}, HTTP_MESSAGES.EN.AUTH_ERROR);

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return response.errorResponse(res, 401, {}, HTTP_MESSAGES.EN.AUTH_ERROR);

    const token = jwt.sign({ id: user.user_id, email: user.email, customer_id: user.customer_id }, JWT_KEY, { expiresIn: "24h" });
    user.password_hash = undefined;

    return response.successResponse(res, 200, { access_token: token }, HTTP_MESSAGES.EN.LOGIN_SUCCESS);
  } catch (error) {
    console.error("Login error:", error);
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

// ==================== Get All Users ====================
export const getAllUsers = async (req, res) => {
  try {
    const customer_id = req.query.customerId || req.user?.customer_id;

    if (!customer_id) {
      return response.errorMessageResponse(res, 400, {}, "Customer ID is required");
    }

    const users = await User.findAll({
      where: { customer_id },
      attributes: [
        "user_id",
        "full_name",
        "username",
        "email",
        "role_id",
        "customer_id",
        "createdAt"
      ],
      include: [
        {
          model: Role,
          as: "Role",
          attributes: [
            "role_id",
            "role_name",
            "is_active",
            "is_deleted",
            "createdAt",
            "updatedAt"
          ],
          include: [
            {
              model: Permission,
              as: "Permissions",
              attributes: ["module_name", "actions"]
            }
          ]
        },
        {
          model: Customer,
          as: "Customer",
          attributes: [
            "customer_id",
            "companyName",
            "companyEmail",
            "phone",
            "CompanyAddress",
            "city",
            "state",
            "is_active",
            "is_deleted",
            "created_at",
            "updated_at"
          ]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    return response.successResponse(
      res,
      200,
      users,
      HTTP_MESSAGES.EN.DATA_GET_SUCCESS
    );
  } catch (error) {
    console.error("❌ Get All Users Error:", error);
    return response.errorMessageResponse(
      res,
      500,
      { message: error.message },
      HTTP_MESSAGES.EN.SERVER_ERROR
    );
  }
};



// ==================== Get User By ID ====================
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.user?.customer_id;

    const user = await User.findOne({
      where: { user_id: id, customer_id },
      attributes: ['user_id', 'username', 'email', 'role_id','customer_id']
    });

    if (!user) return response.errorMessageResponse(res, 404, {}, HTTP_MESSAGES.EN.USER_NOT_FOUND);

    return response.successResponse(res, 200, user.dataValues, HTTP_MESSAGES.EN.DATA_GET_SUCCESS);
  } catch (error) {
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

// ==================== Update User ====================
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const customer_id = req.user?.customer_id;

    const user = await User.findOne({ where: { user_id: userId, customer_id } });
    if (!user) return response.errorMessageResponse(res, 404, {}, HTTP_MESSAGES.EN.USER_NOT_FOUND);

    const { username, full_name, email, role_id, mobile_number, address } = req.body;

    if (username) user.username = username;
    if (full_name) user.full_name = full_name;
    if (email) user.email = email;
    if (role_id) user.role_id = role_id;
    if (mobile_number) user.mobile_number = mobile_number;
    if (address) user.address = address;

    await user.save();

    return response.successResponse(res, 200, { user }, HTTP_MESSAGES.EN.DATA_UPDATED_SUCCESS);
  } catch (error) {
    console.error("Update User Error:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return response.errorMessageResponse(res, 400, {}, HTTP_MESSAGES.EN.EMAIL_ALREADY_EXISTS);
    }
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

// ==================== Delete User ====================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.user?.customer_id;
    if (!id) return response.errorMessageResponse(res, 400, {}, "User ID is required");

    const user = await User.findOne({ where: { user_id: id, customer_id } });
    if (!user) return response.errorMessageResponse(res, 404, {}, "User not found");

    await user.destroy();
    return response.successResponse(res, 200, {}, HTTP_MESSAGES.EN.DATA_DELETED_SUCCESS);
  } catch (error) {
    console.error("Delete User Error:", error);
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};
