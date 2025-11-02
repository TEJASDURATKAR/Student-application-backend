import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // if your file is named user.model.js
import { HTTP_MESSAGES } from '../const/message.js'
import response from "../const/response.js";
import { JWT_KEY } from "../const/credentials.js";
// const JWT_SECRET = process.env.JWT_SECRET;

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


export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return response.errorMessageResponse(
        res,
        404,
        {},
        HTTP_MESSAGES.EN.USER_NOT_FOUND
      );
    }

    // 2. Compare provided password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return response.errorMessageResponse(
        res,
        401,
        {},
        HTTP_MESSAGES.EN.AUTH_ERROR
      );
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email,
        role: user.role_id,
      },
      JWT_KEY,
      { expiresIn: "24h" }
    );

    // 4. Send success response (✅ put token at top-level, user separately)
    return response.successResponse(res, 200, {
      token,
      user: {
        id: user.user_id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        role_id: user.role_id,
        customer_id: user.customer_id,
        mobile_number: user.mobile_number,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Signin Error:", error);
    return response.errorMessageResponse(
      res,
      500,
      {},
      HTTP_MESSAGES.EN.SERVER_ERROR
    );
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
