
import Batches from "../models/Batches.js";
import models from "../models/index.js";
const { Receipt, Customer, Installment, Admission ,FeeSetup} = models;
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

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

    // ✅ 1. Fetch receipt data
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
                { model: Batches, as: "batch" },
              ],
            },
          ],
        },
        { model: Customer, as: "Customer" },
      ],
    });

    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    // ✅ 2. Create uploads folder
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // ✅ 3. PDF setup
    const filePath = path.join(uploadsDir, `receipt_${receipt.receipt_no}.pdf`);
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ✅ 4. Random logo selection
    const logos = [
      "https://cdn.prod.website-files.com/624ac40503a527cf47af4192/659ba59520d886f0cb86d3ba_ai-logo-generator-4.png",
      "https://upload.wikimedia.org/wikipedia/commons/4/44/Google-flutter-logo.svg",
      "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
    ];
    const randomLogo = logos[Math.floor(Math.random() * logos.length)];

    // ✅ Header section
    doc.rect(40, 40, 515, 80).stroke();
    try {
      const logoPath = path.join(uploadsDir, `temp_logo_${Date.now()}.png`);
      const response = await fetch(randomLogo);
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(logoPath, buffer);
      doc.image(logoPath, 50, 50, { width: 60 });
      fs.unlinkSync(logoPath);
    } catch {
      doc.fontSize(14).text("LOGO", 60, 80);
    }

    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("Truvantix Institute of Technology", 120, 55)
      .fontSize(10)
      .text("123 Learning Street, City Center", 120, 80)
      .text("Contact: +91-9876543210 | info@truvantix.com", 120, 95)
      .moveDown(2);

    // ✅ Title
    doc
      .moveDown(2)
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("FEE PAYMENT RECEIPT", { align: "center", underline: true })
      .moveDown(1);

    // ✅ Receipt Details Box
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Receipt No: ${receipt.receipt_no}`)
      .text(`Date: ${new Date(receipt.paid_date).toLocaleDateString()}`)
      .text(`Admission ID: ${receipt.admission_id}`)
      .text(`Installment ID: ${receipt.installment_id}`)
      .moveDown(1);

    // ✅ Student Info Section
    const admission = receipt?.Installment?.fee_setup?.admission;
    const batch = receipt?.Installment?.fee_setup?.batch;

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("STUDENT DETAILS", { underline: true })
      .moveDown(0.5);

    if (admission) {
      doc
        .fontSize(12)
        .font("Helvetica")
        .text(`Name: ${admission.student_name}`)
        .text(`Email: ${admission.student_email}`)
        .text(`Phone: ${admission.student_phone}`);
    }

    if (batch) {
      doc.text(`Batch: ${batch.batch_name} (${batch.batch_code})`);
    }

    doc.moveDown(1.5);

    // ✅ Payment Details
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("PAYMENT DETAILS", { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Amount Paid: ₹${receipt.amount}`)
      .text(`Payment Mode: ${receipt.payment_mode}`)
      .text(`Received By: ${receipt.received_by}`)
      .text(`Remarks: ${receipt.remarks || "N/A"}`)
      .moveDown(2);

    // ✅ Signature line
    doc
      .moveDown(2)
      .fontSize(12)
      .text("________________________", { align: "right" })
      .text("Authorized Signature", { align: "right" })
      .moveDown(1);

    // ✅ Footer section
    doc
      .moveDown(2)
      .fontSize(11)
      .fillColor("#555")
      .text("Thank you for your payment!", { align: "center" })
      .moveDown(0.3)
      .text("This is a computer-generated receipt and does not require a seal.", {
        align: "center",
      });

    // ✅ Finalize
    doc.end();

    // ✅ 10. Send file
    stream.on("finish", () => {
      res.download(filePath, `Receipt_${receipt.receipt_no}.pdf`, (err) => {
        if (err) console.error("Download error:", err);
        fs.unlinkSync(filePath);
      });
    });
  } catch (error) {
    console.error("Error generating receipt PDF:", error);
    res.status(500).json({
      message: "Failed to generate receipt PDF",
      error: error.message,
    });
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
      return res.status(400).json({
        success: false,
        message: "installment_id and amount are required.",
      });
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
    return res.status(201).json({
      success: true,
      message: "Receipt generated successfully.",
      data: newReceipt,
    });
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
      return res.status(404).json({ message: "Receipt not found or access denied" });

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
      return res.status(404).json({ message: "Receipt not found or access denied" });

    // 🔹 Soft delete instead of permanent delete
    await Receipt.update(
      { is_deleted: true, is_active: false },
      { where: { receipt_id: id, customer_id } }
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
      { where: { receipt_id: id, customer_id } }
    );

    if (!restored)
      return res.status(404).json({ message: "Receipt not found or access denied" });

    res.status(200).json({ message: "Receipt restored successfully" });
  } catch (error) {
    console.error("Error restoring receipt:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
