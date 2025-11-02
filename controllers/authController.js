import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { HTTP_MESSAGES } from '../const/message.js'
import response from "../const/response.js";
import { JWT_KEY } from "../const/credentials.js";
import models from "../models/index.js";

const { User, Role, Customer, Permission } = models;
// const JWT_SECRET = process.env.JWT_SECRET;



// ✅ SIGNIN Controller (Fixed)
export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Step 1️⃣: Find active, non-deleted user by email
    const user = await User.findOne({
      where: { email, is_active: true, is_deleted: false },
      attributes: { exclude: ["is_deleted", "token", "created_at", "updated_at", "is_active"] },
    });

    if (!user) {
      return response.errorResponse(res, 404, {}, HTTP_MESSAGES.EN.AUTH_ERROR);
    }

    // Step 2️⃣: Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return response.errorResponse(res, 401, {}, HTTP_MESSAGES.EN.AUTH_ERROR);
    }

    // Step 3️⃣: Generate JWT
    const token = jwt.sign(
      { id: user.user_id, email: user.email, customer_id: user.customer_id },
      JWT_KEY,
      { expiresIn: "24h" }
    );

    // Step 4️⃣: Fetch logged-in user full details (with permissions)
    const userData = await User.findOne({
      where: { user_id: user.user_id },
      attributes: ["customer_id", "user_id", "email", "username", "full_name"],
      include: [
        {
          model: Role,
          as: "Role",
          attributes: ["role_id", "role_name", "role"],
          include: [
            {
              model: Permission,
              as: "Permissions",
              attributes: ["module_name", "actions"],
            },
          ],
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
          ],
        },
      ],
    });

    if (!userData) {
      return response.errorResponse(res, 404, {}, "User details not found");
    }

    // Step 5️⃣: Fetch all users and roles under same customer
    const sameCustomerId = userData.customer_id;

    const customerUsersRaw = await User.findAll({
      where: {
        customer_id: sameCustomerId,
        is_active: true,
        is_deleted: false,
      },
      attributes: ["user_id", "email", "username", "full_name"],
      include: [
        {
          model: Role,
          as: "Role",
          attributes: ["role_id", "role_name", "role"],
          include: [
            {
              model: Permission,
              as: "Permissions",
              attributes: ["module_name", "actions"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Convert each role’s permissions into desired JSON format
    const customerUsers = customerUsersRaw.map((usr) => {
      const role = usr.Role;
      const permissionsObj = {};
      role?.Permissions?.forEach((p) => {
        permissionsObj[p.module_name] = p.actions;
      });

      return {
        ...usr.toJSON(),
        Role: {
          ...role?.toJSON(),
          permission: permissionsObj,
        },
      };
    });

    // Fetch roles with permissions
    const customerRolesRaw = await Role.findAll({
      where: {
        customer_id: sameCustomerId,
        is_active: true,
        is_deleted: false,
      },
      attributes: ["role_id", "role_name", "role"],
      include: [
        {
          model: Permission,
          as: "Permissions",
          attributes: ["module_name", "actions"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const customerRoles = customerRolesRaw.map((r) => {
      const perms = {};
      r.Permissions.forEach((p) => {
        perms[p.module_name] = p.actions;
      });
      return {
        ...r.toJSON(),
        permission: perms,
      };
    });

    // Step 6️⃣: Return combined SaaS-scoped data
    return response.successResponse(
      res,
      200,
      {
        access_token: token,
        userData,
        customerUsers,
        customerRoles,
      },
      HTTP_MESSAGES.EN.LOGIN_SUCCESS
    );
  } catch (error) {
    console.error("Login error:", error);
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};
export const signup = async (req, res) => {
  try {
    const { email, username, full_name, password, roles, mobile_number, address } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return response.errorMessageResponse(res, 400, {}, HTTP_MESSAGES.EN.DATA_ADDED_FAILED);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password:", hashedPassword);
    const newUser = await User.create({
      email,
      username,
      full_name,
      password_hash: hashedPassword,
      roles,
      mobile_number,
      address
    });

    return response.successResponse(res, 200, newUser, HTTP_MESSAGES.EN.DATA_ADDED_SUCCESS
    );
  } catch (error) {
    console.error("Signup Error:", error);
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};



export const signout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return response.errorMessageResponse(res, 404, {}, HTTP_MESSAGES.EN.TOKEN_EXPIRED
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return response.errorMessageResponse(res, 404, {}, HTTP_MESSAGES.EN.USER_NOT_FOUND
      );
    }

    // Invalidate the token (implementation depends on your strategy)
    user.token = null;
    await user.save();

    return response.successResponse(res, 200, {}, HTTP_MESSAGES.EN.LOGOUT_SUCCESS);
  } catch (error) {
    console.error("Signout Error:", error);
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

// controllers/authController.js
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // comes from verifyToken

    const user = await User.findByPk(userId);
    if (!user) return response.errorMessageResponse(res, 404, {}, HTTP_MESSAGES.EN.USER_NOT_FOUND);

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isPasswordValid) {
      return response.errorMessageResponse(res, 400, {}, HTTP_MESSAGES.EN.OLD_PASSWORD_INC);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password_hash = hashedNewPassword;
    await user.save();

    response.successResponse(res, 200, {}, HTTP_MESSAGES.EN.PASSWORD_CHANGE_SUCCESSFUL);
  } catch (error) {
    console.error("ChangePassword Error:", error);
    response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return response.errorMessageResponse(res, 400, {}, HTTP_MESSAGES.EN.EMAIL_IS_REQUIRED);
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return response.errorMessageResponse(res, 404, {}, HTTP_MESSAGES.EN.USER_NOT_FOUND);

    const otp = Math.floor(100000 + Math.random() * 900000);
    user.Otp = otp;
    await user.save();

    console.log(`OTP for ${email}: ${otp}`);
    response.successResponse(res, 200, {}, HTTP_MESSAGES.EN.OTP_SENTON_EMAIL);
  } catch (error) {
    console.error("ForgotPassword Error:", error);
    response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return response.errorMessageResponse(res, 404, {}, HTTP_MESSAGES.EN.USER_NOT_FOUND);

    console.log("User otp from DB:", user.otp);
    console.log("OTP from request:", otp);

    if (!user.otp || user.otp != otp) {
      return response.errorMessageResponse(res, 404, {}, HTTP_MESSAGES.EN.OTP_SENTON_EMAIL);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password_hash = hashedNewPassword;
    user.otp = null; // clear OTP
    await user.save();

    response.successResponse(res, 200, {}, HTTP_MESSAGES.EN.PASSWORD_CHANGE_SUCCESSFUL
    );
  } catch (error) {
    console.error("ResetPassword Error:", error);
    response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};





// export const updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { full_name, mobile_number, address } = req.body;

//     const user = await User.findByPk(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     user.full_name = full_name || user.full_name;
//     user.mobile_number = mobile_number || user.mobile_number;
//     user.address = address || user.address;

//     await user.save();

//     res.status(200).json({ message: "Profile updated successfully", user });
//   } catch (error) {
//     console.error("UpdateProfile Error:", error);
//     res.status(500).json({ message:HTTP_MESSAGES.EN.SERVER_ERROR });
//   }
// };
