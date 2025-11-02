import models from "../models/index.js";
import { Op } from "sequelize";
import response from "../const/response";
import { HTTP_MESSAGES } from "../const/message";
const { Admission, Batches} = models;

// Create a new admission
export const createAdmission = async (req, res) => {
  try {
    const admission = await Admission.create(req.body);
    res.status(201).json({ success: true, data: admission });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllAdmissions = async (req, res) => {
  try {
    const whereClause = {};

    // Optional filtering — e.g. by batchId or student_email
    if (req.query.batchId) {
      whereClause.batch_id = req.query.batchId;
    }
    if (req.query.studentEmail) {
      whereClause.student_email = { [Op.like]: `%${req.query.studentEmail}%` };
    }

    const admissions = await Admission.findAll({
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
      where: whereClause,
      include: [
        {
          model: Batches,
          as: "batch", // alias must match your association
          attributes: [
            "batch_id",
            "batch_name",
            "end_date",
            "status",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
      order: [["createdAt", "DESC"]], // latest admissions first
    });

    // Log for debugging (optional)
    console.log("Fetched admissions:", admissions.map(a => a.dataValues));

    return response.successResponse(
      res,
      200,
      admissions.map(a => a.dataValues),
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
// Get admission by ID
// ✅ Get Admission by ID (with Batch details)
export const getAdmissionById = async (req, res) => {
  try {
    const { admissionId } = req.params;

    const admission = await Admission.findOne({
      where: { admission_id: admissionId },
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
          as: "batch", // must match the alias used in association
          attributes: [
            "batch_id",
            "name",
            "start_date",
            "end_date",
            "status",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
    });

    // Handle not found case
    if (!admission) {
      return response.errorMessageResponse(
        res,
        404,
        { message: "Admission not found" },
        HTTP_MESSAGES.EN.DATA_NOT_FOUND
      );
    }

    // ✅ Return consistent success response
    return response.successResponse(
      res,
      200,
      admission.dataValues,
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


// Update admission
export const updateAdmission = async (req, res) => {
  try {
    const admission = await Admission.findByPk(req.params.admissionId);
    if (!admission) {
      return res.status(404).json({ success: false, error: "Admission not found" });
    }
    await admission.update(req.body);
    res.status(200).json({ success: true, data: admission });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete admission
export const deleteAdmission = async (req, res) => {
  try {
    const admission = await Admission.findByPk(req.params.admissionId);
    if (!admission) {
      return res.status(404).json({ success: false, error: "Admission not found" });
    }
    await admission.destroy();
    res.status(200).json({ success: true, message: "Admission deleted" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
