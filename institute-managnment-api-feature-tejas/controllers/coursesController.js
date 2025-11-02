import models from "../models/index.js";
const { Course, Teacher } = models; // ✅ Import Teacher model

// ✅ Create a new Course (with multiple teachers)
export const createCourse = async (req, res) => {
  try {
    console.log("✅ Incoming course creation request");
    console.log("🟢 Full request body:", req.body);

    const { teacher_ids, ...courseData } = req.body;

    console.log("📦 Extracted teacher_ids:", teacher_ids);
    console.log("📦 Extracted courseData:", courseData);

    if (!Array.isArray(teacher_ids) || teacher_ids.length === 0) {
      console.warn("⚠️ No teacher_ids provided or not an array!");
      return res.status(400).json({
        success: false,
        message: "Please assign at least one teacher to the course.",
      });
    }

    // ✅ Handle both formats [{ teacher_id, name }] or [1, 2, 3]
    let teacherIdsToCheck = [];

    if (teacher_ids[0]?.teacher_id) {
      teacherIdsToCheck = teacher_ids.map((t) => t.teacher_id);
      console.log("🧾 Extracted teacherIds (from teacher_id key):", teacherIdsToCheck);
    } else if (teacher_ids[0]?.id) {
      teacherIdsToCheck = teacher_ids.map((t) => t.id);
      console.log("🧾 Extracted teacherIds (from id key):", teacherIdsToCheck);
    } else {
      teacherIdsToCheck = teacher_ids.map((t) => Number(t));
      console.log("🧾 Extracted teacherIds (from numeric array):", teacherIdsToCheck);
    }

    // ✅ Check if all teacher IDs exist in DB
    const validTeachers = await Teacher.findAll({
      where: { teacher_id: teacherIdsToCheck },
    });

    console.log("✅ Found valid teachers:", validTeachers.map((t) => t.teacher_id));

    if (validTeachers.length !== teacherIdsToCheck.length) {
      console.error("❌ Teacher validation failed");
      console.log("🧩 Expected:", teacherIdsToCheck);
      console.log("🧩 Found:", validTeachers.map((t) => t.teacher_id));

      return res.status(400).json({
        success: false,
        message: "One or more teacher IDs are invalid.",
      });
    }

    // 🧱 Prepare teacher data for storage
    const teacherData = validTeachers.map((t) => ({
      teacher_id: t.teacher_id,
      name: t.name,
    }));

    console.log("🧠 Prepared teacherData to store:", teacherData);

    // ✅ Create the course record
    const course = await Course.create({
      ...courseData,
      teacher_ids: teacherData,
    });

    console.log("✅ Course created successfully:", course.course_id);

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    console.error("❌ Create Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating course",
      error: error.message,
    });
  }
};


// ✅ Update Course
// ✅ UPDATE COURSE
export const updateCourse = async (req, res) => {
  try {
    console.log("🛠️ Incoming course update request");
    console.log("🟢 Params courseId:", req.params.courseId);
    console.log("🟢 Request body:", req.body);

    const { teacher_ids, ...updateData } = req.body;
    const courseId = req.params.courseId;

    const course = await Course.findByPk(courseId);

    if (!course) {
      console.warn("⚠️ Course not found:", courseId);
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    console.log("📦 Existing course data:", course.dataValues);

    if (!Array.isArray(teacher_ids) || teacher_ids.length === 0) {
      console.warn("⚠️ teacher_ids missing or invalid in request body");
      return res.status(400).json({
        success: false,
        message: "Please assign at least one teacher to the course.",
      });
    }

    // ✅ Normalize teacher IDs like in createCourse
    let teacherIdsToCheck = [];

    if (teacher_ids[0]?.teacher_id) {
      teacherIdsToCheck = teacher_ids.map((t) => t.teacher_id);
      console.log("🧾 Extracted teacherIds (from teacher_id key):", teacherIdsToCheck);
    } else if (teacher_ids[0]?.id) {
      teacherIdsToCheck = teacher_ids.map((t) => t.id);
      console.log("🧾 Extracted teacherIds (from id key):", teacherIdsToCheck);
    } else {
      teacherIdsToCheck = teacher_ids.map((t) => Number(t));
      console.log("🧾 Extracted teacherIds (from numeric array):", teacherIdsToCheck);
    }

    // ✅ Validate teacher IDs in DB
    const validTeachers = await Teacher.findAll({
      where: { teacher_id: teacherIdsToCheck },
    });

    console.log("✅ Found valid teachers:", validTeachers.map((t) => t.teacher_id));

    if (validTeachers.length !== teacherIdsToCheck.length) {
      console.error("❌ Teacher validation failed");
      console.log("🧩 Expected:", teacherIdsToCheck);
      console.log("🧩 Found:", validTeachers.map((t) => t.teacher_id));

      return res.status(400).json({
        success: false,
        message: "One or more teacher IDs are invalid.",
      });
    }

    // 🧱 Prepare teacher data for storage
    const teacherData = validTeachers.map((t) => ({
      teacher_id: t.teacher_id,
      name: t.name,
    }));

    console.log("🧠 Prepared teacherData to update:", teacherData);

    // ✅ Update course
    await course.update({
      ...updateData,
      teacher_ids: teacherData,
    });

    console.log("✅ Course updated successfully:", course.course_id);

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    console.error("❌ Update Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating course",
      error: error.message,
    });
  }
};

// ✅ Get All Courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Courses fetched successfully",
      data: courses,
    });
  } catch (error) {
    console.error("❌ Get All Courses Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching courses",
      error: error.message,
    });
  }
};

// ✅ Get Course By ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.courseId);

    if (!course)
      return res.status(404).json({ success: false, message: "Course not found" });

    return res.status(200).json({
      success: true,
      message: "Course fetched successfully",
      data: course,
    });
  } catch (error) {
    console.error("❌ Get Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching course",
      error: error.message,
    });
  }
};

// ✅ Delete Course
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.courseId);

    if (!course)
      return res.status(404).json({ success: false, message: "Course not found" });

    await course.destroy();

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting course",
      error: error.message,
    });
  }
};
