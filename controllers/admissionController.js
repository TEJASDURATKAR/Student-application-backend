import models from "../models/index.js";
import { Op } from "sequelize";
import response from "../const/response.js";
import { HTTP_MESSAGES } from "../const/message.js";

const { Admission, Batches } = models;

// ----------------------
// CREATE Admission (SaaS Scoped)
// ----------------------
export const createAdmission = async (req, res) => {
  try {
    // ✅ Get customer_id from authenticated user (middleware must attach it)
    const customer_id = req.user?.customer_id || req.body.customer_id;

    if (!customer_id) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required",
      });
    }

    const { student_name, student_email, student_phone, batch_id } = req.body;

    const admission = await Admission.create({
      student_name,
      student_email,
      student_phone,
      batch_id,
      customer_id,
    });

    return response.successResponse(
      res,
      201,
      admission,
      HTTP_MESSAGES.EN.DATA_ADD_SUCCESS
    );
  } catch (error) {
    console.error("Create Admission Error:", error);
    return response.errorMessageResponse(
      res,
      400,
      { message: error.message },
      HTTP_MESSAGES.EN.SERVER_ERROR
    );
  }
};

// ----------------------
// GET ALL Admissions (SaaS Scoped)
// ----------------------
export const getAllAdmissions = async (req, res) => {
  try {
    const customer_id = req.user?.customer_id || req.query.customer_id;

    if (!customer_id) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required",
      });
    }

    const whereClause = { customer_id };

    // Optional filters
    if (req.query.batchId) whereClause.batch_id = req.query.batchId;
    if (req.query.studentEmail)
      whereClause.student_email = { [Op.like]: `%${req.query.studentEmail}%` };

    const admissions = await Admission.findAll({
      where: whereClause,
      attributes: [
        "admission_id",
        "student_name",
        "student_email",
        "student_phone",
        "batch_id",
        "admission_date",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: Batches,
          as: "batch",
          attributes: [
            "batch_id",
            "batch_name",
            "batch_code",
            "course_id",
            "end_date",
            "status",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return response.successResponse(
      res,
      200,
      admissions,
      HTTP_MESSAGES.EN.DATA_GET_SUCCESS
    );
  } catch (error) {
    console.error("Get All Admissions Error:", error);
    return response.errorMessageResponse(
      res,
      500,
      { message: error.message },
      HTTP_MESSAGES.EN.SERVER_ERROR
    );
  }
};

// ----------------------
// GET Admission BY ID (SaaS Scoped)
// ----------------------
export const getAdmissionById = async (req, res) => {
  try {
    const customer_id = req.user?.customer_id || req.query.customer_id;
    const { admissionId } = req.params;

    if (!customer_id) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required",
      });
    }

    const admission = await Admission.findOne({
      where: { admission_id: admissionId, customer_id },
      include: [
        {
          model: Batches,
          as: "batch",
          attributes: [
            "batch_id",
            "batch_name",
            "batch_code",
            "end_date",
            "status",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
    });

    if (!admission) {
      return response.errorMessageResponse(
        res,
        404,
        { message: "Admission not found" },
        HTTP_MESSAGES.EN.DATA_NOT_FOUND
      );
    }

    return response.successResponse(
      res,
      200,
      admission,
      HTTP_MESSAGES.EN.DATA_GET_SUCCESS
    );
  } catch (error) {
    console.error("Get Admission By ID Error:", error);
    return response.errorMessageResponse(
      res,
      500,
      { message: error.message },
      HTTP_MESSAGES.EN.SERVER_ERROR
    );
  }
};

// ----------------------
// UPDATE Admission (SaaS Scoped)
// ----------------------
export const updateAdmission = async (req, res) => {
  try {
    const customer_id = req.user?.customer_id || req.body.customer_id;
    const { admissionId } = req.params;

    if (!customer_id) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required",
      });
    }

    const admission = await Admission.findOne({
      where: { admission_id: admissionId, customer_id },
    });

    if (!admission) {
      return res
        .status(404)
        .json({ success: false, message: "Admission not found" });
    }

    await admission.update(req.body);

    return response.successResponse(
      res,
      200,
      admission,
      HTTP_MESSAGES.EN.DATA_UPDATED_SUCCESS
    );
  } catch (error) {
    console.error("Update Admission Error:", error);
    return response.errorMessageResponse(
      res,
      400,
      { message: error.message },
      HTTP_MESSAGES.EN.SERVER_ERROR
    );
  }
};

// ----------------------
// DELETE Admission (SaaS Scoped)
// ----------------------
export const deleteAdmission = async (req, res) => {
  try {
    const customer_id = req.user?.customer_id || req.query.customer_id;
    const { admissionId } = req.params;

    if (!customer_id) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required",
      });
    }

    const admission = await Admission.findOne({
      where: { admission_id: admissionId, customer_id },
    });

    if (!admission) {
      return res
        .status(404)
        .json({ success: false, message: "Admission not found" });
    }

    await admission.destroy();

    return response.successResponse(
      res,
      200,
      {},
      HTTP_MESSAGES.EN.DATA_DELETED_SUCCESS
    );
  } catch (error) {
    console.error("Delete Admission Error:", error);
    return response.errorMessageResponse(
      res,
      400,
      { message: error.message },
      HTTP_MESSAGES.EN.SERVER_ERROR
    );
  }
};
