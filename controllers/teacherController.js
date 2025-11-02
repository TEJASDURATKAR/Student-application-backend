import models from "../models/index.js";
const { Teacher, Course } = models;

// ----------------------
// CREATE Teacher (SaaS Scoped)
// ----------------------
export const createTeacher = async (req, res) => {
  try {
    // ✅ Get customer_id from authenticated user
    const customer_id = req.user?.customer_id || req.body.customer_id;

    if (!customer_id) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    const teacher = await Teacher.create({
      ...req.body,
      customer_id, // 👈 Add it here
    });

    res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      data: teacher,
    });
  } catch (error) {
    console.error("Create Teacher Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------
// GET All Teachers (SaaS Scoped)
// ----------------------
export const getAllTeachers = async (req, res) => {
  try {
    const customer_id = req.user?.customer_id || req.query.customer_id;

    if (!customer_id) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    const teachers = await Teacher.findAll({
      where: { customer_id },
      include: [
        {
          model: Course,
          as: "courses",
          attributes: ["course_id", "name", "course_code"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: teachers,
    });
  } catch (error) {
    console.error("Get All Teachers Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------
// GET Teacher by ID (SaaS Scoped)
// ----------------------
export const TeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.user?.customer_id || req.query.customer_id;

    const teacher = await Teacher.findOne({
      where: { teacher_id: id, customer_id },
      include: [{ model: Course, as: "courses", attributes: ["course_id", "name"] }],
    });

    if (!teacher)
      return res.status(404).json({ message: "Teacher not found for this customer" });

    res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------
// UPDATE Teacher (SaaS Scoped)
// ----------------------
export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.user?.customer_id || req.body.customer_id;

    const teacher = await Teacher.findOne({ where: { teacher_id: id, customer_id } });
    if (!teacher)
      return res.status(404).json({ message: "Teacher not found for this customer" });

    await teacher.update(req.body);
    res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: teacher,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------
// DELETE Teacher (SaaS Scoped)
// ----------------------
export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.user?.customer_id || req.query.customer_id;

    const teacher = await Teacher.findOne({ where: { teacher_id: id, customer_id } });
    if (!teacher)
      return res.status(404).json({ message: "Teacher not found for this customer" });

    await teacher.destroy();
    res.status(200).json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
