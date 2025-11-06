import models from "../models/index.js";
const { Teacher, Course } = models;
import response from "../const/response.js";
import { HTTP_MESSAGES } from "../const/message.js";

// ----------------------
// CREATE Teacher (SaaS Scoped)
// ----------------------
export const createTeacher = async (req, res) => {
  try {
    const customer_id = req.user?.customer_id || req.body.customer_id;

    if (!customer_id) {
      return response.errorMessageResponse(
        res,
        400,
        {},
        HTTP_MESSAGES.EN.CUSTOMER_ID_REQUIRED
      );
    }

    const teacher = await Teacher.create({
      ...req.body,
      customer_id,
    });

    return response.successResponse(
      res,
      201,
      teacher,
      HTTP_MESSAGES.EN.CREATE_SUCCESS("Teacher")
    );
  } catch (error) {
    console.error("❌ Create Teacher Error:", error);
    return response.errorMessageResponse(
      res,
      500,
      {},
      HTTP_MESSAGES.EN.SERVER_ERROR
    );
  }
};

// ----------------------
// GET All Teachers (SaaS Scoped)
// ----------------------
export const getAllTeachers = async (req, res) => {
  try {
    const customer_id = req.user?.customer_id || req.query.customer_id;

    if (!customer_id) {
      return response.errorMessageResponse(
        res,
        400,
        {},
        HTTP_MESSAGES.EN.CUSTOMER_ID_REQUIRED
      );
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

    return response.successResponse(
      res,
      200,
      teachers,
      HTTP_MESSAGES.EN.FETCH_SUCCESS("Teachers")
    );
  } catch (error) {
    console.error("❌ Get All Teachers Error:", error);
    return response.errorMessageResponse(
      res,
      500,
      {},
      HTTP_MESSAGES.EN.SERVER_ERROR
    );
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

    if (!teacher) {
      return response.errorMessageResponse(
        res,
        404,
        {},
        HTTP_MESSAGES.EN.NOT_FOUND("Teacher")
      );
    }

    return response.successResponse(
      res,
      200,
      teacher,
      HTTP_MESSAGES.EN.DATA_FETCH_SUCCESS("Teacher")
    );
  } catch (error) {
    console.error("❌ Get Teacher By ID Error:", error);
    return response.errorMessageResponse(
      res,
      500,
      {},
      HTTP_MESSAGES.EN.SERVER_ERROR
    );
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
    if (!teacher) {
      return response.errorMessageResponse(
        res,
        404,
        {},
        HTTP_MESSAGES.EN.NOT_FOUND("Teacher")
      );
    }

    await teacher.update(req.body);

    return response.successResponse(
      res,
      200,
      teacher,
      HTTP_MESSAGES.EN.UPDATE_SUCCESS("Teacher")
    );
  } catch (error) {
    console.error("❌ Update Teacher Error:", error);
    return response.errorMessageResponse(
      res,
      500,
      {},
      HTTP_MESSAGES.EN.SERVER_ERROR
    );
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
    if (!teacher) {
      return response.errorMessageResponse(
        res,
        404,
        {},
        HTTP_MESSAGES.EN.NOT_FOUND("Teacher")
      );
    }

    await teacher.destroy();

    return response.successResponse(
      res,
      200,
      {},
      HTTP_MESSAGES.EN.DELETE_SUCCESS("Teacher")
    );
  } catch (error) {
    console.error("❌ Delete Teacher Error:", error);
    return response.errorMessageResponse(
      res,
      500,
      {},
      HTTP_MESSAGES.EN.SERVER_ERROR
    );
  }
};
