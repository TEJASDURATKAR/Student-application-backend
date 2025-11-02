import { HTTP_MESSAGES } from "../const/message";
import response from "../const/response";
import User from "../models/User";


export const mustBeSuperAdmin = async (req, res, next) => {
  const user_id = req.user._id
  const user = await User.findOne({
    attributes: ["role"],
    where: { id: user_id }
  });
  if (user.role === "SUPERADMIN") {
    return next(); // Add return statement here
  } else {
    return response.unAuthorizedErrorMsgResponse(
      res,
      403,
      HTTP_MESSAGES.EN.NOT_AUTHORIZED
    );
  }
};

export const mustBeAdmin = async (req, res, next) => {
  const user_id = req.user.user_id;
  const user = await User.findOne({
    attributes: ["role"],
    where: { id: user_id }
  });
  if (user.role === "ADMIN") {
    return next(); // Add return statement here
  } else {
    return response.unAuthorizedErrorMsgResponse(
      res,
      403,
      HTTP_MESSAGES.EN.NOT_AUTHORIZED
    );
  }
};


export const mustBeStaff = async (req, res, next) => {
  const user_id = req.user._id;
  const user = await User.findOne({
    attributes: ["role"],
    where: { id: user_id }
  });
  if (user.role === "STAFF") {
    return next(); // Add return statement here
  } else {
    return response.unAuthorizedErrorMsgResponse(
      res,
      403,
      HTTP_MESSAGES.EN.NOT_AUTHORIZED
    );
  }
};

export const eitherAdminOrSuperAdmin = async (req, res, next) => {
  const user_id = req.user._id;
  const user = await User.findOne({
    attributes: ["role"],
    where: { id: user_id }
  });
  if (user.role === "ADMIN" || user.role === "SUPERADMIN") {
    return next(); // Add return statement here
  } else {
    return response.unAuthorizedErrorMsgResponse(
      res,
      403,
      HTTP_MESSAGES.EN.NOT_AUTHORIZED
    );
  }
};
