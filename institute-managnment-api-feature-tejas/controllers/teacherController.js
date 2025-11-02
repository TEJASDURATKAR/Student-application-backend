import models from "../models/index.js";
const { Teacher, Course } = models;



// ✅ Create a new Teacher
export const createTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.create(req.body);
    console.log("Teacher model:", Teacher);
    console.log("Teacher model in controller:", Teacher?.getTableName?.() || Teacher);

    res.status(201).json({ message: "Teacher created successfully", teacher });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all Teachers with their Courses
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll({
      include: [{ model: Course, as: "courses", attributes: ["course_id", "name", "course_code"] }]
    });
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Teacher by ID
export const TeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      include: [{ model: Course, as: "courses", attributes: ["course_id", "name"] }]
    });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.status(200).json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Teacher
export const updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    await teacher.update(req.body);
    res.status(200).json({ message: "Teacher updated successfully", teacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Teacher
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    await teacher.destroy();
    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
