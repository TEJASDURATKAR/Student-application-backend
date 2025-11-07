import models from "../models/index.js";
const { Installment, FeeSetup } = models;

/* ======================================================
   ✅ Create Installment (for an existing FeeSetup)
====================================================== */
export const createInstallment = async (req, res) => {
  try {
    const customer_id = req.user?.customer_id || req.query.customer_id;
    const { fee_id, installment_due_date, amount, status = "pending" } = req.body;

    if (!customer_id)
      return res.status(400).json({ success: false, message: "customer_id is required" });

    // ✅ Validate Fee Setup exists
    const feeSetup = await FeeSetup.findOne({ where: { fee_id, customer_id } });
    if (!feeSetup)
      return res.status(404).json({ success: false, message: "Fee setup not found for this customer" });

    const installment = await Installment.create({
      fee_id,
      installment_due_date,
      amount,
      status,
      customer_id,
      is_active: true,
      is_deleted: false,
    });

    res.status(201).json({
      success: true,
      message: "Installment created successfully",
      data: installment,
    });
  } catch (error) {
    console.error("❌ createInstallment error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

/* ======================================================
   ✅ Get All Installments (optionally filtered by fee_id)
====================================================== */
export const getAllInstallments = async (req, res) => {
  try {
    const customer_id = req.user?.customer_id || req.query.customer_id;
    const { fee_id } = req.query;

    const where = { customer_id, is_deleted: false };
    if (fee_id) where.fee_id = fee_id;

    const installments = await Installment.findAll({
      where,
      order: [["installment_due_date", "ASC"]],
      include: [{ model: FeeSetup, as: "fee_setup" }], // ✅ consistent alias
    });

    res.status(200).json({
      success: true,
      count: installments.length,
      data: installments,
    });
  } catch (error) {
    console.error("❌ getAllInstallments error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

/* ======================================================
   ✅ Get Single Installment by ID
====================================================== */
export const getInstallmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.user?.customer_id || req.query.customer_id;

    const installment = await Installment.findOne({
      where: { installment_id: id, customer_id, is_deleted: false },
      include: [{ model: FeeSetup, as: "fee_setup" }], // ✅ alias fixed
    });

    if (!installment)
      return res.status(404).json({ success: false, message: "Installment not found" });

    res.status(200).json({ success: true, data: installment });
  } catch (error) {
    console.error("❌ getInstallmentById error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

/* ======================================================
   ✅ Update Installment (amount, date, status)
====================================================== */
export const updateInstallment = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.user?.customer_id || req.query.customer_id;
    const { installment_due_date, amount, status } = req.body;

    const installment = await Installment.findOne({
      where: { installment_id: id, customer_id, is_deleted: false },
    });

    if (!installment)
      return res.status(404).json({ success: false, message: "Installment not found" });

    await installment.update({
      installment_due_date: installment_due_date || installment.installment_due_date,
      amount: amount ?? installment.amount,
      status: status || installment.status,
    });

    res.status(200).json({
      success: true,
      message: "Installment updated successfully",
      data: installment,
    });
  } catch (error) {
    console.error("❌ updateInstallment error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

/* ======================================================
   ✅ Soft Delete Installment
====================================================== */
export const deleteInstallment = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.user?.customer_id || req.query.customer_id;

    const installment = await Installment.findOne({
      where: { installment_id: id, customer_id, is_deleted: false },
    });

    if (!installment)
      return res.status(404).json({ success: false, message: "Installment not found" });

    await installment.update({ is_deleted: true, is_active: false });

    res.status(200).json({
      success: true,
      message: "Installment deleted successfully",
    });
  } catch (error) {
    console.error("❌ deleteInstallment error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};