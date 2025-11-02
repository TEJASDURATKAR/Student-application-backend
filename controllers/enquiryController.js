import { HTTP_MESSAGES } from "../const/message.js";
import response from "../const/response.js";
import models from "../models/index.js";

const { Enquiry, Customer, User } = models;

/**
 * ✅ CREATE ENQUIRY (SaaS Scoped)
 */
export const createEnquiry = async (req, res) => {
  try {
    // ✅ Ensure authenticated user and valid customer
    if (!req.user || !req.user.id || !req.user.customer_id) {
      return response.errorResponse(res, 401, null, "Unauthorized or invalid customer");
    }

    const { name, email, phone, course_intrested, source, status, followup_date } = req.body;

    // ✅ Validate required fields
    if (!name || !email || !phone || !course_intrested) {
      return response.errorResponse(res, 400, null, "All required fields must be provided");
    }

    // ✅ Prepare enquiry data
    const enquiryData = {
      name,
      email,
      phone,
      course_intrested,
      source: source || null,
      status: status || "new",
      followup_date: followup_date || null,
      user_id: req.user.id,        // use id from JWT
      handled_by: req.user.id,     // handled by same user
      customer_id: req.user.customer_id, // SaaS tenant linkage
    };

    // ✅ Create enquiry
    const enquiry = await Enquiry.create(enquiryData);

    return response.successResponse(res, 201, enquiry, HTTP_MESSAGES.EN.DATA_ADDED_SUCCESS);
  } catch (error) {
    console.error("❌ Create Enquiry Error:", error);
    return response.errorResponse(res, 500, null, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

/**
 * ✅ GET ALL ENQUIRIES (Scoped by customer_id)
 */
export const getAllEnquiries = async (req, res) => {
  try {
    const customer_id = req.user?.customer_id || req.body.customer_id;

    if (!customer_id) {
      return response.errorResponse(res, 400, null, "customer_id is required");
    }

    const enquiries = await Enquiry.findAll({
      where: { customer_id },
      include: [
        {
          model: Customer,
          as: "Customer",
          attributes: ["customer_id", "companyName", "companyEmail"],
        },
        {
          model: User,
          as: "HandledBy",
          attributes: ["user_id", "full_name", "email"], // ✅ Fixed alias & key
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    return response.successResponse(res, 200, enquiries, HTTP_MESSAGES.EN.DATA_FETCH_SUCCESS);
  } catch (error) {
    console.error("❌ Get All Enquiries Error:", error);
    return response.errorResponse(res, 500, error, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

/**
 * ✅ GET SINGLE ENQUIRY BY ID (Scoped by customer_id)
 */
export const getEnquiryById = async (req, res) => {
  try {
    const { enquiryId } = req.params;
    const customer_id = req.user?.customer_id || req.body.customer_id;

    if (!customer_id) {
      return response.errorResponse(res, 400, null, "customer_id is required");
    }

    const enquiry = await Enquiry.findOne({
      where: { enquiry_id: enquiryId, customer_id },
      include: [
        {
          model: Customer,
          as: "Customer",
          attributes: ["customer_id", "companyName", "companyEmail"],
        },
        {
          model: User,
          as: "HandledBy",
          attributes: ["user_id", "full_name", "email"], // ✅ Match structure
        },
      ],
    });

    if (!enquiry) {
      return response.errorResponse(res, 404, {}, HTTP_MESSAGES.EN.DATA_NOT_FOUND);
    }

    return response.successResponse(res, 200, enquiry, HTTP_MESSAGES.EN.DATA_FETCH_SUCCESS);
  } catch (error) {
    console.error("❌ Get Enquiry Error:", error);
    return response.errorResponse(res, 500, error, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

/**
 * ✅ UPDATE ENQUIRY (Scoped by customer_id)
 */
export const updateEnquiry = async (req, res) => {
  try {
    const { enquiryId } = req.params;
    const customer_id = req.user?.customer_id || req.body.customer_id;

    if (!customer_id) {
      return response.errorResponse(res, 400, null, "customer_id is required");
    }

    const enquiry = await Enquiry.findOne({
      where: { enquiry_id: enquiryId, customer_id },
    });

    if (!enquiry) {
      return response.errorResponse(res, 404, {}, HTTP_MESSAGES.EN.DATA_NOT_FOUND);
    }

    await enquiry.update(req.body);

    return response.successResponse(res, 200, enquiry, HTTP_MESSAGES.EN.DATA_UPDATED_SUCCESS);
  } catch (error) {
    console.error("❌ Update Enquiry Error:", error);
    return response.errorResponse(res, 500, error, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

/**
 * ✅ DELETE ENQUIRY (Scoped by customer_id)
 */
export const deleteEnquiry = async (req, res) => {
  try {
    const { enquiryId } = req.params;
    const customer_id = req.user?.customer_id || req.body.customer_id;

    if (!customer_id) {
      return response.errorResponse(res, 400, null, "customer_id is required");
    }

    const enquiry = await Enquiry.findOne({
      where: { enquiry_id: enquiryId, customer_id },
    });

    if (!enquiry) {
      return response.errorResponse(res, 404, {}, HTTP_MESSAGES.EN.DATA_NOT_FOUND);
    }

    await enquiry.destroy();

    return response.successResponse(res, 200, {}, HTTP_MESSAGES.EN.DATA_DELETED_SUCCESS);
  } catch (error) {
    console.error("❌ Delete Enquiry Error:", error);
    return response.errorResponse(res, 500, error, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};
