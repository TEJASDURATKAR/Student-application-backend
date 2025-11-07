import { Op } from "sequelize";
import { HTTP_MESSAGES } from "../const/message.js";
import response from "../const/response.js";
import models from "../models/index.js";

const { Course, User, Permission, Customer, Role } = models;

/* ==========================================================
   ✅ Fetch all teacher users (using User + Role)
   ========================================================== */
export const getUsersWhoAreTeachers = async (req, res) => {
  try {
    const customer_id = req.query.customerId || req.user?.customer_id;

    if (!customer_id) {
      return response.errorMessageResponse(res, 400, {}, "Customer ID is required");
    }

    // ✅ Fetch users whose role_name = 'teacher'
    const teacherUsers = await User.findAll({
      where: { customer_id },
      attributes: [
        "user_id",
        "full_name",
        "username",
        "email",
        "role_id",
        "customer_id",
        "createdAt",
      ],
      include: [
        {
          model: Role,
          as: "Role",
          attributes: [
            "role_id",
            "role_name",
            "is_active",
            "is_deleted",
            "createdAt",
            "updatedAt",
          ],
          where: {
            role_name: { [Op.iLike]: "teacher" },
            is_active: true,
            is_deleted: false,
          },
          include: [
            {
              model: Permission,
              as: "Permissions",
              attributes: ["module_name", "actions"],
            },
          ],
        },
        {
          model: Customer,
          as: "Customer",
          attributes: [
            "customer_id",
            "companyName",
            "companyEmail",
            "phone",
            "CompanyAddress",
            "city",
            "state",
            "is_active",
            "is_deleted",
            "created_at",
            "updated_at",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!teacherUsers || teacherUsers.length === 0) {
      return response.successResponse(
        res,
        200,
        [],
        "No teacher users found for this customer"
      );
    }

    return response.successResponse(
      res,
      200,
      teacherUsers,
      "Teacher users fetched successfully"
    );
  } catch (error) {
    console.error("❌ Get Teacher Users Error:", error);
    return response.errorMessageResponse(
      res,
      500,
      { message: error.message },
      HTTP_MESSAGES.EN.SERVER_ERROR
    );
  }
};

/* ==========================================================
   ✅ Create a new Course (using teacher users, not Teacher model)
   ========================================================== */
export const createCourse = async (req, res) => {
  try {
    console.log("✅ Incoming course creation request");

    const customer_id = req.user?.customer_id || req.query.customer_id;
    if (!customer_id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access. Customer ID missing.",
      });
    }

    const { teacher_ids, ...courseData } = req.body;

    if (!Array.isArray(teacher_ids) || teacher_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please assign at least one teacher to the course.",
      });
    }

    // ✅ Normalize teacher IDs
    const teacherIdsToCheck = teacher_ids.map((t) => Number(t.id));

    // ✅ Validate that all teacher_ids are actual users with role_name = 'teacher'
    const validTeachers = await User.findAll({
      where: {
        user_id: { [Op.in]: teacherIdsToCheck },
        customer_id,
      },
      include: [
        {
          model: Role,
          as: "Role",
          where: {
            role_name: { [Op.iLike]: "teacher" },
            is_active: true,
            is_deleted: false,
          },
          attributes: ["role_name"],
        },
      ],
    });

    if (validTeachers.length !== teacherIdsToCheck.length) {
      return res.status(400).json({
        success: false,
        message: "One or more teacher IDs are invalid or not teachers.",
      });
    }

    // 🧱 Prepare teacher data
    const teacherData = validTeachers.map((t) => ({
      user_id: t.user_id,
      full_name: t.full_name,
      email: t.email,
    }));

    // ✅ Create the course record
    const course = await Course.create({
      ...courseData,
      teacher_ids: teacherData, // JSON array of user info
      customer_id,
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

/* ==========================================================
   ✅ Update Course
   ========================================================== */
export const updateCourse = async (req, res) => {
  try {
    console.log("🛠️ Incoming course update request");
    const customer_id = req.user?.customer_id || req.query.customer_id;

    if (!customer_id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access. Customer ID missing.",
      });
    }

    const courseId = req.params.courseId;
    const { teacher_ids, ...updateData } = req.body;

    // ✅ Find existing course
    const course = await Course.findOne({
      where: { course_id: courseId, customer_id },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found for this customer.",
      });
    }

    if (!Array.isArray(teacher_ids) || teacher_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please assign at least one teacher to the course.",
      });
    }

    // ✅ Normalize teacher IDs
    const teacherIdsToCheck = teacher_ids.map((t) =>
      t?.teacher_id || t?.id || Number(t)
    );

    // ✅ Validate teachers (User table)
    const validTeachers = await User.findAll({
      where: {
        user_id: teacherIdsToCheck,
        customer_id,
      },
      include: [
        {
          model: Role,
          as: "Role",
          where: {
            role_name: { [Op.iLike]: "teacher" },
            is_active: true,
            is_deleted: false,
          },
        },
      ],
    });

    if (validTeachers.length !== teacherIdsToCheck.length) {
      return res.status(400).json({
        success: false,
        message: "One or more teacher IDs are invalid or not linked to your account.",
      });
    }

    const teacherData = validTeachers.map((t) => ({
      teacher_id: t.user_id,
      name: t.full_name,
      email: t.email,
    }));

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

/* ==========================================================
   ✅ Get All Courses
   ========================================================== */
export const getAllCourses = async (req, res) => {
  try {
    const customer_id = req.user?.customer_id || req.query.customer_id;

    const courses = await Course.findAll({
      where: { customer_id },
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

/* ==========================================================
   ✅ Get Course by ID
   ========================================================== */
export const getCourseById = async (req, res) => {
  try {
    const customer_id = req.user?.customer_id || req.query.customer_id;
    const course = await Course.findOne({
      where: { course_id: req.params.courseId, customer_id },
    });

    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found for this customer." });

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

/* ==========================================================
   ✅ Delete Course
   ========================================================== */
export const deleteCourse = async (req, res) => {
  try {
    const customer_id = req.user?.customer_id || req.query.customer_id;

    const course = await Course.findOne({
      where: { course_id: req.params.courseId, customer_id },
    });

    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found for this customer." });

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