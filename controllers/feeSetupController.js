import { Op } from "sequelize";
import models from "../models/index.js";

const { Batches, FeeSetup, Installment, Admission, Customer, Course } = models;

// ✅ Create Fee Setup (scoped by customer)
export const createFeeSetup = async (req, res) => {
  try {
    const customer_id = req.user?.customer_id || req.query.customer_id;
    const {
      admission_id,
      batch_id,
      total_fee,
      discount,
      payable_fee,
      payment_type,
      advance_money = 0,
      payment_status = "pending", // ✅ default if not provided
      installments = [],
    } = req.body;

    if (!customer_id)
      return res
        .status(400)
        .json({ success: false, message: "customer_id is required" });

    // ✅ Verify Admission belongs to this customer
    const admission = await Admission.findOne({ where: { admission_id, customer_id } });
    if (!admission)
      return res
        .status(404)
        .json({ success: false, message: "Admission not found for this customer" });

    // ✅ Verify Batch belongs to this customer
    const batch = await Batches.findOne({ where: { batch_id, customer_id } });
    if (!batch)
      return res
        .status(404)
        .json({ success: false, message: "Batch not found for this customer" });

    // ✅ Step 1: Create Fee Setup
    const feeSetup = await FeeSetup.create({
      admission_id,
      batch_id,
      customer_id,
      total_fee,
      discount,
      payable_fee,
      advance_money,
      payment_type,
      payment_status, // ✅ Added
      is_active: true,
      is_deleted: false,
    });

    // ✅ Step 2: Bulk Insert Installments (if applicable)
    if (payment_type === "installment" && installments.length > 0) {
      const bulkData = installments.map((inst) => ({
        fee_id: feeSetup.fee_id,
        installment_due_date: inst.due_date,
        amount: inst.amount,
        status: inst.status || "pending",
         paid_date: inst.paid_date || null, 
        customer_id,
      }));

      await Installment.bulkCreate(bulkData, { validate: true });
    }

    // ✅ Step 3: Return response
    return res.status(201).json({
      success: true,
      message: "Fee setup created successfully",
      data: feeSetup,
    });
  } catch (error) {
    console.error("❌ createFeeSetup error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ Get All Fee Setups (scoped by customer)
export const getAllFeeSetups = async (req, res) => {
  try {
    const customer_id = req.user?.customer_id || req.query.customer_id;

    const fees = await FeeSetup.findAll({
      where: { customer_id, is_deleted: false },
      include: [
        { model: Admission, as: "admission" },
        { model: Installment, as: "installments" },
        {
          model: Batches,
          as: "batch",
          include: [
            {
              model: Course,
              as: "course", // ✅ fetch course from batch
              attributes: ["course_id", "name","fee"], // only what you need
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, count: fees.length, data: fees });
  } catch (error) {
    console.error("❌ getAllFeeSetups error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ Get Fee Setup by ID (scoped by customer)
export const getFeeSetupById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.user?.customer_id || req.query.customer_id;

    const feeSetup = await FeeSetup.findOne({
      where: { fee_id: id, customer_id },
      include: [
        { model: Admission, as: "admission" },
        { model: Installment, as: "installments" },
        {
          model: Batches,
          as: "batch",
          include: [
            {
              model: Course,
              as: "course", // ✅ fetch course info inside batch
              attributes: ["course_id", "name"],
            },
          ],
        },
      ],
    });

    if (!feeSetup)
      return res
        .status(404)
        .json({ success: false, message: "Fee setup not found for this customer" });

    res.status(200).json({ success: true, data: feeSetup });
  } catch (error) {
    console.error("❌ getFeeSetupById error:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// ✅ Update FeeSetup (scoped by customer)
export const updateFeeSetup = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.user?.customer_id || req.query.customer_id;

    const {
      total_fee,
      discount,
      payable_fee,
      payment_type,
      advance_money,
      payment_status, // ✅ added field
      installments = [],
    } = req.body;

    // ✅ Find Fee Setup
    const feeSetup = await FeeSetup.findOne({ where: { fee_id: id, customer_id } });
    if (!feeSetup)
      return res.status(404).json({
        success: false,
        message: "Fee setup not found for this customer",
      });

    // ✅ Update Fee Setup main fields
    await feeSetup.update({
      total_fee,
      discount,
      payable_fee,
      advance_money,
      payment_type,
      payment_status, // ✅ added field
    });

    // ✅ If payment_type is "installment", handle installment logic
    if (payment_type === "installment") {
      const existingInstallments = await Installment.findAll({
        where: { fee_id: id, customer_id },
      });

      const existingIds = existingInstallments.map((i) => i.installment_id);
      const updatedIds = [];

      for (const inst of installments) {
        if (inst.installment_id) {
          // 🟢 Update existing installment
          await Installment.update(
            {
              installment_due_date: inst.due_date || inst.installment_due_date,
              paid_date: inst.paid_date || null,
              amount: inst.amount,
              status: inst.status || "pending",
            },
            {
              where: {
                installment_id: inst.installment_id,
                fee_id: id,
                customer_id,
              },
            }
          );
          updatedIds.push(inst.installment_id);
        } else if (inst.amount && inst.due_date) {
          // 🟢 Add new installment
          const newInst = await Installment.create({
            fee_id: id,
            installment_due_date: inst.due_date,
            amount: inst.amount,
            status: inst.status || "pending",
            customer_id,
          });
          updatedIds.push(newInst.installment_id);
        }
      }

      // 🗑 Delete installments removed from frontend
      const toDelete = existingIds.filter((eid) => !updatedIds.includes(eid));
      if (toDelete.length > 0) {
        await Installment.destroy({
          where: {
            installment_id: { [Op.in]: toDelete },
            fee_id: id,
            customer_id,
          },
        });
      }
    }

    // ✅ Fetch latest data with all installments
    const updated = await FeeSetup.findOne({
      where: { fee_id: id, customer_id },
      include: [{ model: Installment, as: "installments" }],
    });

    return res.status(200).json({
      success: true,
      message: "Fee setup and installments updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("❌ updateFeeSetup error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ Delete Fee Setup (soft delete + related installments)
export const deleteFeeSetup = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.user?.customer_id || req.query.customer_id || null;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Fee ID is required",
      });
    }

    const whereCondition = customer_id
      ? { fee_id: id, customer_id, is_deleted: false }
      : { fee_id: id, is_deleted: false };

    const feeSetup = await FeeSetup.findOne({ where: whereCondition });

    if (!feeSetup) {
      return res.status(404).json({
        success: false,
        message: "Fee setup not found or already deleted",
      });
    }

    // ✅ Step 1: Soft delete FeeSetup
    await feeSetup.update({ is_deleted: true, is_active: false });

    // ✅ Step 2: Delete related installments (hard delete)
    await Installment.destroy({
      where: { fee_id: id, customer_id },
    });

    return res.status(200).json({
      success: true,
      message: "Fee setup and related installments deleted successfully",
      fee_id: id,
    });
  } catch (error) {
    console.error("❌ deleteFeeSetup error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
