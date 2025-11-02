import response from "../const/response";

const Joi = require("joi");

// Define a schema for the request body
const companyInfoSchema = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  dob: Joi.string().integer().required(),
  company_name: Joi.string().required(),
  company_desc: Joi.string().required(),
  company_address: Joi.string().required(),
  foundation_year: Joi.string().integer().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().required(),
  gst_number: Joi.string().required(),
  business_type: Joi.string().required(),
});

export const validatecompanyInfo = async (req, res, next) => {
  const { error } =  companyInfoSchema.validate(req.body);
  if (error) {
    const normalizedError = {
      type: "ValidationError",
      message: "Invalid Input. Please Check Again",
      errors: error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message
      }))
    };
    return response.somethingErrorMsgResponse(res, 400, normalizedError.message, {});
  }
  // Validate if CompanyInfo exist or not
  return next();
};
