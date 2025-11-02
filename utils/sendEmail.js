import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMail = async (to, subject, message, html = "") => {
  try {
    console.log(to, subject, message)
    const info = await transporter.sendMail({
      from: `"Tejas D" < ${process.env.EMAIL_USER} >`,
      to,
      subject,
      text: message,
      html,
    });
    console.log("✅ Email sent:", info.messageId);
    return info.messageId
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw error;
  }
};