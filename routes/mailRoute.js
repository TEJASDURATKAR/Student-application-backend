import express from "express";
import { sendMail } from "../utils/sendEmail.js";

export const mailRouter = express.Router();

mailRouter.post("/send-email", async (req, res) => {
       const { to, subject, message } = req.body;

       try {
              await sendMail(to, subject, message);
              res.status(200).json({ success: true, message: "Email sent!" });
       } catch (err) {
              res.status(500).json({ success: false, message: "Failed to send email", error: err.message });
       }
});