import { sequelize } from "../config/db.config.js";
import models from "../models/index.js";
const { Batches, Course, Admission } = models;

// 🔹 Helper function to generate batch code
// 🔹 Efficient batch code generator
// 🔹 Generate unique batch code safely
// 🔹 Generate unique batch code safely (no duplicates)
// 🔹 Generate a truly unique batch code
// 🔹 Generate a unique random 4-digit batch code
export const generateBatchCode = async (customer_id) => {
  let unique = false;
  let batch_code;
  let attempts = 0;

  while (!unique) {
    attempts++;
    if (attempts > 100) throw new Error("Unable to generate unique batch code after 100 attempts");

    // Generate a random 4-digit number
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    batch_code = `TRUVANTIX-${randomNumber}`;

    // Check if this batch_code already exists for the customer
    const exists = await Batches.findOne({
      where: { batch_code, customer_id }
    });

    if (!exists) unique = true;
  }

  return batch_code;
};

// 🔹 Create new batch safely
export const createBatch = async (req, res) => {
  try {
    const customer_id = req.user?.customer_id || req.query.customer_id;
    const { course_id, teacher_ids, batch_name, end_date, max_students } = req.body;

    if (!course_id) return res.status(400).json({ success: false, message: "Course ID is required" });
    if (!Array.isArray(teacher_ids) || teacher_ids.length === 0)
      return res.status(400).json({ success: false, message: "Please assign at least one teacher" });

    // 🔹 Generate a unique random batch code
    const batch_code = await generateBatchCode(customer_id);

    // ✅ Create batch entry
    const batch = await Batches.create({
      batch_code,
      batch_name,
      course_id,
      teacher_ids,
      end_date,
      max_students,
      customer_id,
      is_active: true,
      is_deleted: false,
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: batch,
    });
  } catch (error) {
    console.error("❌ Create Batch Error:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Batch code already exists, please try again",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error while creating batch",
      error: error.message,
    });
  }
};
// 🔹 Get all batches (scoped by customer)
export const getAllBatches = async (req, res) => {
  try {
    const customer_id = req.user?.customer_id || req.query.customer_id;

    const batches = await Batches.findAll({
      where: { is_deleted: false, customer_id },
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["course_id", "name", "course_code", "teacher_ids"],
        },
        { model: Admission, as: "admissions" },
      ],
      order: [["batch_id", "DESC"]],
    });

    const result = batches.map((batch) => {
      const courseTeachers = batch.course?.teacher_ids || [];
      const selectedTeachers = (batch.teacher_ids || [])
        .map((t) => courseTeachers.find((ct) => ct.teacher_id === (t.id || t.teacher_id)))
        .filter(Boolean);
      return {
        ...batch.toJSON(),
        teacher_ids: selectedTeachers,
      };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("❌ Fetch Batches Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch batches", error: error.message });
  }
};

// 🔹 Get single batch by ID (scoped by customer)
export const getBatchById = async (req, res) => {
  try {
    const { batchId } = req.params;
    const customer_id = req.user?.customer_id || req.query.customer_id;

    const batch = await Batches.findOne({
      where: { batch_id: batchId, is_deleted: false, customer_id },
      include: [
        { model: Course, as: "course", attributes: ["course_id", "name", "course_code", "teacher_ids"] },
        { model: Admission, as: "admissions" },
      ],
    });

    if (!batch)
      return res.status(404).json({ success: false, message: "Batch not found for this customer" });

    const courseTeachers = batch.course?.teacher_ids || [];
    const selectedTeachers = (batch.teacher_ids || [])
      .map((t) => courseTeachers.find((ct) => ct.teacher_id === (t.id || t.teacher_id)))
      .filter(Boolean);

    res.status(200).json({
      success: true,
      data: { ...batch.toJSON(), teacher_ids: selectedTeachers },
    });
  } catch (error) {
    console.error("❌ Fetch Batch By ID Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch batch", error: error.message });
  }
};

// 🔹 Update batch (scoped by customer)
export const updateBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { teacher_ids, course_id, ...updateData } = req.body;
    const customer_id = req.user?.customer_id || req.query.customer_id;

    const batch = await Batches.findOne({ where: { batch_id: batchId, customer_id } });
    if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });

    if (teacher_ids && course_id) {
      const course = await Course.findOne({ where: { course_id, customer_id } });
      if (!course)
        return res.status(400).json({ success: false, message: "Invalid course ID for this customer" });

      const invalidTeachers = teacher_ids.filter(
        (t) => !course.teacher_ids.find((ct) => ct.teacher_id === (t.id || t.teacher_id))
      );

      if (invalidTeachers.length > 0)
        return res.status(400).json({
          success: false,
          message: "Some selected teachers are not assigned to this course",
        });
    }

    await batch.update({ ...updateData, teacher_ids });
    res.status(200).json({ success: true, message: "Batch updated successfully", data: batch });
  } catch (error) {
    console.error("❌ Update Batch Error:", error);
    res.status(500).json({ success: false, message: "Failed to update batch", error: error.message });
  }
};

// 🔹 Soft delete batch (scoped by customer)
export const deleteBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const customer_id = req.user?.customer_id || req.query.customer_id;

    const batch = await Batches.findOne({ where: { batch_id: batchId, customer_id } });
    if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });

    await batch.update({ is_deleted: true, is_active: false });
    res.status(200).json({ success: true, message: "Batch deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Batch Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete batch", error: error.message });
  }
};
