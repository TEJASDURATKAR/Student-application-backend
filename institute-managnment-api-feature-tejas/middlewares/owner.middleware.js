import response from "../const/response";

const Joi = require("joi");

// Define a schema for the request body
const ownerSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(), 
  dob: Joi.string().integer().required,
  email: Joi.string().email().required(),
  phone_no: Joi.string().integer().required(),
  pin_code:Joi.string().integer().required(),
  state: Joi.string().required(),
  company_name: Joi.string().required(),
  organization_name: Joi.string().required(),
  company_desc: Joi.string().required(),
  office_address: Joi.string().required(),
  city: Joi.string().required(),
  country: Joi.string().required(),
  GST_number: Joi.string().required(),
  created:Joi.string().isoDate().required(),
  modified: Joi.string().required()
});

export const validateOwner = async (req, res, next) => {
  const { error } = ownerSchema.validate(req.body);
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
  // Validate if User exist or not
  return next();

};
