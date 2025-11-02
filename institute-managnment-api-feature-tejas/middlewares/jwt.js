import jwt from "jsonwebtoken";
import { JWT_KEY } from "../const/credentials";
import { HTTP_MESSAGES } from "../const/message";
import response from "../const/response";

console.log("-->", JWT_KEY);


export const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.somethingErrorMsgResponse(
      res,
      403,
      {},
      HTTP_MESSAGES.EN.TOKEN_INVALID
    );
  }

  const token = authHeader.split(" ")[1]; // Take the second part

  try {
    const decoded = jwt.verify(token, JWT_KEY);
    req.user = decoded;
    console.log("decoded", decoded);
    return next();
  } catch (err) {
    console.log("error", err);
    return response.unAuthorizedErrorMsgResponse(
      res,
      403,
      {},
      HTTP_MESSAGES.EN.TOKEN_EXPIRED
    );
  }
};

