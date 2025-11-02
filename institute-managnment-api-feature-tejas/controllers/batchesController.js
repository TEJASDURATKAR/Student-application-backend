import models from "../models/index.js";
const { Batches, Course, Teacher, Admission } = models;

// 🔹 Helper function to generate batch code
export const generateBatchCode = async () => {
  const lastBatch = await Batches.findOne({
    order: [["batch_id", "DESC"]],
  });

  let newNumber = 1;
  if (lastBatch?.batch_code) {
    const parts = lastBatch.batch_code.split("-");
    const numberPart = parseInt(parts[1], 10);
    if (!isNaN(numberPart)) newNumber = numberPart + 1;
  }

  return "TRUVANTIX-" + String(newNumber).padStart(4, "0");
};

// 🔹 Create new batch (linked with course & multiple teachers)
export const createBatch = async (req, res) => {
  try {
    console.log("🟢 Incoming batch creation request:", req.body);

    const { course_id, teacher_ids, ...batchData } = req.body;

    if (!course_id) {
      console.log("❌ Missing course_id in request");
      return res.status(400).json({ success: false, message: "Course ID is required" });
    }

    if (!Array.isArray(teacher_ids) || teacher_ids.length === 0) {
      console.log("❌ No teachers provided for batch");
      return res.status(400).json({ success: false, message: "Please assign at least one teacher" });
    }

    // ✅ Verify that the course exists
    const course = await Course.findByPk(course_id);
    if (!course) {
      console.log(`❌ Course not found for course_id: ${course_id}`);
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    console.log("📚 Course found:", course.name, "with teacher_ids:", course.teacher_ids);

    // ✅ Validate teacher IDs (ensure these teachers belong to the course)
    const courseTeachers = course.teacher_ids || [];
    console.log("📌 Course teachers JSON:", courseTeachers);

    const invalidTeachers = teacher_ids.filter(
      (t) => !courseTeachers.find((ct) => ct.teacher_id === (t.id || t.teacher_id))
    );

    if (invalidTeachers.length > 0) {
      console.log("❌ Invalid teachers selected:", invalidTeachers);
      return res.status(400).json({
        success: false,
        message: "Some selected teachers are not assigned to this course",
        invalidTeachers,
      });
    }

    // 🔢 Generate unique batch code
    const batch_code = await generateBatchCode();
    console.log("🔖 Generated batch code:", batch_code);

    // ✅ Create batch entry
    const batch = await Batches.create({
      ...batchData,
      batch_code,
      course_id,
      teacher_ids, // stored as JSON automatically via model getter/setter
    });

    console.log("✅ Batch created successfully with ID:", batch.batch_id);

    return res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: batch,
    });
  } catch (error) {
    console.error("❌ Create Batch Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating batch",
      error: error.message,
    });
  }
};

// 🔹 Get all batches with course + teacher details
// 🔹 Get all batches with only course-related teachers
export const getAllBatches = async (req, res) => {
  try {
    const batches = await Batches.findAll({
      where: { is_deleted: false },
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

    // Map batch teacher_ids to only include full teacher info from course
    const result = batches.map((batch) => {
      const courseTeachers = batch.course?.teacher_ids || [];
      const selectedTeachers = (batch.teacher_ids || []).map((t) =>
        courseTeachers.find((ct) => ct.teacher_id === (t.id || t.teacher_id))
      ).filter(Boolean); // remove nulls
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

// 🔹 Get single batch by ID with only course-related teachers
export const getBatchById = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await Batches.findOne({
      where: { batch_id: batchId, is_deleted: false },
      include: [
        { model: Course, as: "course", attributes: ["course_id", "name", "course_code", "teacher_ids"] },
        { model: Admission, as: "admissions" },
      ],
    });

    if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });

    const courseTeachers = batch.course?.teacher_ids || [];
    const selectedTeachers = (batch.teacher_ids || []).map((t) =>
      courseTeachers.find((ct) => ct.teacher_id === (t.id || t.teacher_id))
    ).filter(Boolean);

    res.status(200).json({
      success: true,
      data: { ...batch.toJSON(), teacher_ids: selectedTeachers },
    });
  } catch (error) {
    console.error("❌ Fetch Batch By ID Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch batch", error: error.message });
  }
};

// 🔹 Update batch
export const updateBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { teacher_ids, course_id, ...updateData } = req.body;

    const batch = await Batches.findOne({ where: { batch_id: batchId } });
    if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });

    if (teacher_ids && course_id) {
      const course = await Course.findByPk(course_id);
      if (!course) return res.status(400).json({ success: false, message: "Invalid course ID" });

      const invalidTeachers = teacher_ids.filter(
        (t) => !course.teacher_ids.find((ct) => ct.teacher_id === (t.id || t.teacher_id))
      );

      if (invalidTeachers.length > 0) return res.status(400).json({ success: false, message: "Some selected teachers are not assigned to this course" });
    }

    await batch.update({ ...updateData, teacher_ids });
    res.status(200).json({ success: true, message: "Batch updated successfully", data: batch });
  } catch (error) {
    console.error("❌ Update Batch Error:", error);
    res.status(500).json({ success: false, message: "Failed to update batch", error: error.message });
  }
};

// 🔹 Soft delete batch
export const deleteBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await Batches.findOne({ where: { batch_id: batchId } });
    if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });

    await batch.update({ is_deleted: true, is_active: false });
    res.status(200).json({ success: true, message: "Batch deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Batch Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete batch", error: error.message });
  }
};
