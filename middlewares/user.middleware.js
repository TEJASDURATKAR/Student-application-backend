import response from "../const/response";

const Joi = require("joi");

// Define a schema for the request body
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(16).required()
});

export const validateUserLogin = async (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
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
  
  return next();
};
