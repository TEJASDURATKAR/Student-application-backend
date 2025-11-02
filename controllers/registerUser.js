import { HTTP_MESSAGES } from "../const/message.js";
import response from "../const/response.js";
import sendEmail from "../utils/sendEmail.js";

export const registerUser = async (req, res) => {
  const { email, name } = req.body;

  try {
    // Save user logic here...

    const subject = "Welcome to Techo!";
    const body = `<h1>Hello ${name}</h1><p>Thank you for registering.</p>`;
    await sendEmail(email, subject, body);

    return response.successResponse(res, 201, HTTP_MESSAGES.EN.OTP_SENTON_EMAIL);
  } catch (err) {
    console.error("❌ Error in registerUser:", err);
    return response.errorResponse(res, 500, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};
