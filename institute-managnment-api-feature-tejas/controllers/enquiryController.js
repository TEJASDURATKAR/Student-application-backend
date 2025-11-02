import { HTTP_MESSAGES } from "../const/message";
import response from "../const/response";
import Enquiry from "../models/Enquiry";

// CREATE
export const createEnquiry = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    // Ensure user is logged in
    if (!req.user || !req.user.id) {
      return response.errorResponse(res, 401, null, "Unauthorized");
    }

    // Destructure required fields from request body
    const { name, email, phone, course_intrested, source, status, followup_date } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !course_intrested) {
      return response.errorResponse(res, 400, null, "All required fields must be provided");
    }

    // Prepare enquiry data with logged-in user's ID
    const enquiryData = {
      name,
      email,
      phone,
      course_intrested,
      source: source || null,
      status: status || "new",
      followup_date: followup_date || null,
      user_id: req.user.id,
      handled_by: req.user.id // ✅ assign logged-in user as handler
    };

    // Save enquiry to database
    const enquiry = await Enquiry.create(enquiryData);

    // Return success response
    return response.successResponse(
      res,
      201,
      enquiry,
      HTTP_MESSAGES.EN.DATA_ADDED_SUCCESS
    );
  } catch (error) {
    console.error("Create Enquiry Error:", error);
    return response.errorResponse(
      res,
      400,
      null,
      error.message || HTTP_MESSAGES.EN.SERVER_ERROR
    );
  }
};



// READ (all)
export const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.findAll({
      order: [['updatedAt', 'DESC']], // Sorts by latest updated or added entry
    });
    res.json({ success: true, data: enquiries });
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const updateEnquiry = async (req, res) => {
  try {
    const { enquiryId } = req.params;

    // Find the enquiry by ID
    const enquiry = await Enquiry.findByPk(enquiryId);

    if (!enquiry) {
      return response.errorResponse(
        res,
        404,
        {},
        HTTP_MESSAGES.EN.DATA_NOT_FOUND
      );
    }

    // Update only with fields provided in body
    await enquiry.update(req.body);

    return response.successResponse(
      res,
      200,
      enquiry, // return updated enquiry
      HTTP_MESSAGES.EN.DATA_UPDATED_SUCCESS
    );
  } catch (error) {
    console.error("Update Enquiry Error:", error);

    return response.errorResponse(
      res,
      400,
      error,
      HTTP_MESSAGES.EN.SERVER_ERROR
    );
  }
};

// READ (single)
export const getEnquiryById = async (req, res) => {
  try {
    console.log(req.params);
    const enquiry = await Enquiry.findByPk(req.params.enquiryId, {});
    console.log(enquiry);

    if (!enquiry) {
      return response.errorResponse(res, 404, HTTP_MESSAGES.EN.DATA_NOT_FOUND);
    }

    return response.successResponse(
      res,
      200,
      enquiry,
      HTTP_MESSAGES.EN.DATA_FETCH_SUCCESS,
    );
  } catch (error) {
    return response.errorResponse(
      res,
      400,
      error,
      HTTP_MESSAGES.EN.SERVER_ERROR,
    );
  }
};
// DELETE
export const deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByPk(req.params.enquiryId);

    if (!enquiry) {
      return response.errorResponse(res, 404, HTTP_MESSAGES.EN.DATA_NOT_FOUND);
    }

    await enquiry.destroy();
    return response.successResponse(
      res,
      204,
      null,
      HTTP_MESSAGES.EN.DATA_DELETED_SUCCESS,
    );
  } catch (error) {
    return response.errorResponse(
      res,
      400,
      error,
      HTTP_MESSAGES.EN.SERVER_ERROR,
    );
  }
};
