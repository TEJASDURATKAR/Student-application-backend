import Batches from "../models/Batches.js";
import models from "../models/index.js";
const { Receipt, Customer, Course,Installment, Admission, FeeSetup } = models;
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import response from "../const/response.js";
import { HTTP_MESSAGES } from "../const/message.js";


/** Utility: Generate unique receipt number */
const generateReceiptNo = async (customer_id) => {
  const count = await Receipt.count({ where: { customer_id } });
  const num = count + 1;
  return `REC-${String(num).padStart(5, "0")}`; // Example: REC-00001
};

/** ✅ Download Receipt as PDF */
export const downloadReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const receipt = await Receipt.findOne({
      where: { receipt_id: id },
      include: [
        {
          model: Installment,
          as: "Installment",
          include: [
            {
              model: FeeSetup,
              as: "fee_setup",
              include: [
                { model: Admission, as: "admission" },
                {
                  model: Batches,
                  as: "batch",
                  include: [
                    {
                      model: Course, // ✅ include Course here
                      as: "course",
                      attributes: ["course_id", "name"],
                    },
                  ],
                },
              ],
            },
          ],
        },
        { model: Customer, as: "Customer" },
      ],
    });

    if (!receipt) {
      return response.errorMessageResponse(
        res,
        404,
        { message: "Receipt not found" },
        HTTP_MESSAGES.EN.DATA_NOT_FOUND
      );  
    }

    // ✅ Read local logo and convert to Base64
    const logoPath = path.join(__dirname, "../asset/reciept-logo1.png");
    const logoImage = fs.readFileSync(logoPath);
    const logoBase64 = `data:image/png;base64,${logoImage.toString("base64")}`;

    // ✅ Extract data for receipt display
    const admission = receipt?.Installment?.fee_setup?.admission;
    const batch = receipt?.Installment?.fee_setup?.batch;
    const courseName =
      receipt?.Installment?.fee_setup?.batch?.course?.name || "N/A";

    const customer = receipt?.Customer;

    // ✅ Correct Remaining Fee Calculation
    const feeSetup = receipt?.Installment?.fee_setup;
    const totalFee = parseFloat(feeSetup?.total_fee || 0);
    const discount = parseFloat(feeSetup?.discount || 0);
    const advance = parseFloat(feeSetup?.advance_money || 0);

    const feeSetupId = feeSetup?.fee_id;
    let totalPaid = 0;

    if (feeSetupId) {
      const allInstallments = await Installment.findAll({
        where: { fee_id: feeSetupId },
        attributes: ["amount", "status"],
      });

      // ✅ Only sum installments that are marked as paid
      totalPaid = allInstallments
        .filter((inst) => inst.status === "paid")
        .reduce((sum, inst) => sum + parseFloat(inst.amount || 0), 0);
    }

    // ✅ Payable = Total - Discount
    const payable = totalFee - discount;

    // ✅ Remaining = Payable - (Advance + Paid)
    const balance = Math.max(payable - (advance + totalPaid), 0);

    // ✅ Final data for PDF
    const data = {
      receiptNo: receipt.receipt_no,
      date: new Date(receipt.paid_date).toLocaleDateString(),
      studentName: admission?.student_name || "N/A",
      batchName: batch?.batch_name || "N/A",
      courseName: courseName,
      totalAmount: totalFee,
      feePaid: receipt.amount || 0,
      balance: balance.toFixed(2),
      installmentNo: receipt?.Installment?.installment_no || "N/A",
      customerName: customer?.customer_name || "Truvantix Software Services",
    };

    console.log("Receipt Data for PDF:", data);

    // ✅ HTML Template for PDF
    const htmlContent = `
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * {
        box-sizing: border-box;
      }
      body {
        font-family: 'Arial', sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f8f9fa;
      }
      .container {
        width: 90%;
        max-width: 800px;
        margin: 20px auto;
        border: 2px solid #000;
        border-radius: 10px;
        padding: 20px 25px 10px; /* ✅ bottom padding for footer */
        background: #fff;
        height: 480px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .header-logo img {
        width: 230px;
        height: auto;
      }
      .header-right {
        text-align: right;
        font-size: 14px;
      }

      h2.customer-name {
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        margin: 5px 0 5px;
        color: #000;
        text-transform: uppercase;
      }

      .title {
        text-align: center;
        font-weight: bold;
        font-size: 15px;
        margin-top: 2px;
      }

      hr {
        border: none;
        border-top: 2px solid #000;
        margin: 6px 0;
      }

      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px 30px;
        font-size: 13px;
        flex-grow: 1;
      }

      .label {
        font-weight: bold;
        color: #000;
      }
      .value {
        border: 1px solid #000;
        padding: 3px 6px;
        border-radius: 4px;
        min-height: 18px;
      }

      .signatures {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 10px;
        padding-top: 5px;
      }

      .sign-box {
        text-align: center;
      }

      .sign-box img {
        width: 80px;
        opacity: 0.7;
      }

      .footer {
        background: #007bff;
        color: white;
        text-align: center;
        padding: 6px;
        border-radius: 6px;
        font-size: 12px;
        margin-top: 10px;
      }

      @media print {
        body {
          background: white;
          margin: 0;
          padding: 0;
        }
        .container {
          height: auto;
          page-break-after: avoid;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="header-logo">
          <img src="${logoBase64}" alt="Logo" />
        </div>
        <div class="header-right">
          <div><b>Date:</b> ${data.date}</div>
          <div><b>Receipt No:</b> ${data.receiptNo}</div>
        </div>
      </div>

      <!-- Customer Name -->
      <h2 class="customer-name">${data.customerName}</h2>

      <div class="title">Learning | Training | Placement | Internship</div>
      <hr />

      <!-- Info Grid -->
      <div class="info-grid">
        <div><span class="label">Student Name:</span></div>
        <div class="value">${data.studentName}</div>

        <div><span class="label">Batch Name:</span></div>
        <div class="value">${data.batchName}</div>

        <div><span class="label">Course Name:</span></div>
        <div class="value">${data.courseName}</div>

        <div><span class="label">Total Amount:</span></div>
        <div class="value">₹${data.totalAmount}</div>

        <div><span class="label">Fees Paid:</span></div>
        <div class="value">₹${data.feePaid}</div>

        <div><span class="label">Fees Balance:</span></div>
        <div class="value">₹${data.balance}</div>
      </div>

      <!-- Signatures -->
      <div class="signatures">
        <div class="sign-box">
          <img src="https://tse1.mm.bing.net/th/id/OIP.4jzWkDeSgqx73vk9Qj37lgHaHk?pid=Api&P=0&h=220" alt="signature" />
          <p>Authorized Signature</p>
        </div>
        <div class="sign-box">
          <img src="https://tse3.mm.bing.net/th/id/OIP.VyXKxYBEQ236AcAceFfMGQHaFs?pid=Api&P=0&h=220" alt="stamp" />
          <p>Official Stamp</p>
        </div>
      </div>

      <div class="footer">
        📍 Vairagade Complex, Nandanvan Nagpur | 📞 7620004185 | 9373464207
      </div>
    </div>
  </body>
</html>
`;

    // ✅ Generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", bottom: "15mm", left: "10mm", right: "10mm" },
    });

    await browser.close();

    // ✅ Send the file as a download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Receipt_${data.receiptNo}.pdf`
    );
    res.end(pdfBuffer);
  } catch (error) {
    console.error("PDF generation failed:", error);
    return response.somethingErrorMsgResponse(
      res,
      500,
      HTTP_MESSAGES.EN.SERVER_ERROR,
      error.message || ""
    );
    // res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const createReceipt = async (req, res) => {
  try {
    const customer_id = req.user?.customer_id || req.body.customer_id;
    const {
      installment_id,
      admission_id: frontendAdmissionId,
      amount,
      payment_mode,
      received_by,
      remarks,
      paid_date,
    } = req.body;

    // ✅ Step 1: Validate required fields
    if (!installment_id || !amount) {
      return response.errorMessageResponse(
        res,
        400,
        {},
        HTTP_MESSAGES.EN.MANDATORY_FIELDS_MISSING
      );  
    }

    // ✅ Step 2: Fetch related FeeSetup to auto-fill admission_id if needed
    const installment = await Installment.findOne({
      where: { installment_id },
      include: [
        {
          model: FeeSetup,
          as: "fee_setup", // must match association alias
          attributes: ["admission_id", "customer_id"],
        },
      ],
    });

    if (!installment) {
      return res.status(404).json({
        success: false,
        message: "Installment not found.",
      });
    }

    // ✅ Step 3: Derive admission_id & customer_id safely
    const admission_id =
      frontendAdmissionId || installment.fee_setup?.admission_id || null;
    const derived_customer_id =
      customer_id || installment.fee_setup?.customer_id || null;

    // ✅ Step 4: Generate unique receipt number using your utility
    const receipt_no = await generateReceiptNo(derived_customer_id);

    // ✅ Step 5: Create the receipt
    const newReceipt = await Receipt.create({
      customer_id: derived_customer_id,
      installment_id,
      admission_id,
      receipt_no,
      amount,
      payment_mode,
      received_by,
      remarks,
      paid_date: paid_date || new Date(),
    });

    // ✅ Step 6: Update installment status
    await installment.update({ payment_status: "paid" });

    // ✅ Step 7: Respond
    return response.successResponse(
      res,
      201,
      { receipt: newReceipt },
      HTTP_MESSAGES.EN.DATA_ADDED_SUCCESS
    );      
  } catch (error) {
    console.error("Error creating receipt:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating receipt.",
      error: error.message,
    });
  }
};

/** ✅ Get all receipts */
export const getAllReceipts = async (req, res) => {
  try {
    const customer_id = req.user?.customer_id || req.query.customer_id;

    if (!customer_id) {
      return res.status(400).json({ message: "customer_id is required" });
    }

    const receipts = await Receipt.findAll({
      where: { customer_id, is_deleted: false },
      include: [
        { model: Installment, as: "Installment" },
        { model: Admission, as: "Admission" },
        { model: Customer, as: "Customer" },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(receipts);
  } catch (error) {
    console.error("Error fetching receipts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/** ✅ Get single receipt by ID */
export const getReceiptById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.user?.customer_id || req.query.customer_id;

    const receipt = await Receipt.findOne({
      where: { receipt_id: id, customer_id, is_deleted: false },
      include: [
        { model: Installment, as: "Installment" },
        { model: Admission, as: "Admission" },
        { model: Customer, as: "Customer" },
      ],
    });

    if (!receipt)
      return res
        .status(404)
        .json({ message: "Receipt not found or access denied" });

    res.status(200).json(receipt);
  } catch (error) {
    console.error("Error fetching receipt by ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/** ✅ Soft delete receipt (recommended) */
export const deleteReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.user?.customer_id || req.query.customer_id;

    const receipt = await Receipt.findOne({
      where: { receipt_id: id, customer_id, is_deleted: false },
    });

    if (!receipt)
      return res
        .status(404)
        .json({ message: "Receipt not found or access denied" });

    // 🔹 Soft delete instead of permanent delete
    await Receipt.update(
      { is_deleted: true, is_active: false },
      { where: { receipt_id: id, customer_id } },
    );

    res.status(200).json({ message: "Receipt deleted successfully" });
  } catch (error) {
    console.error("Error deleting receipt:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/** ✅ Optional: Restore a soft-deleted receipt */
export const restoreReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.user?.customer_id || req.query.customer_id;

    const restored = await Receipt.update(
      { is_deleted: false, is_active: true },
      { where: { receipt_id: id, customer_id } },
    );

    if (!restored)
      return res
        .status(404)
        .json({ message: "Receipt not found or access denied" });

    res.status(200).json({ message: "Receipt restored successfully" });
  } catch (error) {
    console.error("Error restoring receipt:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
