import Role from '../models/Role';
import response from "../const/response.js";
import { HTTP_MESSAGES } from "../const/message.js";

// CREATE
export const createRole = async (req, res) => {
  try {
    const { role_name, role, permission } = req.body;

    if (!role_name || !role || !permission) {
      return response.errorMessageResponse(
        res,
        400,
        {},
        HTTP_MESSAGES.EN.ALL_FEILEDS_REQUIRED
      );
    }

    const newRole = await Role.create({ role_name, role, permission });

    console.log("Sending new role to backend:", req.body);

    return response.successResponse(
      res,
      200,
      newRole,
      HTTP_MESSAGES.EN.DATA_ADDED_SUCCESS
    );
  } catch (error) {
    console.error("Create role error:", error);
    return response.errorMessageResponse(
      res,
      500,
      error.message,
      HTTP_MESSAGES.EN.SERVER_ERROR
    );
  }
};

export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [['createdAt', 'DESC']],   // ✅ latest roles first
      raw: true,                        // optional: cleaner objects
      nest: true
    });

    if (!roles || roles.length === 0) {
      return response.errorMessageResponse(res, 404, {}, "No roles found");
    }
   console.log("Fetched roles:", roles);
    return response.successResponse(res, 200, roles, "Roles fetched successfully");
  } catch (err) {
    console.error("Error fetching roles:", err);
    return response.errorMessageResponse(res, 500, err, "Error fetching roles");
  }
};


// GET ONE
export const getRoleById = async (req, res) => {
  try {
    const roles = await Role.findByPk(req.params.id);
    if (!role) return response.errorMessageResponse(res,404, {}, HTTP_MESSAGES.EN.ROLE_NOT_FOUND); 
    res.json({ success: true, data: roles });
  } catch (error) {
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

// UPDATE
export const updateRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return response.errorMessageResponse(res,404, {}, HTTP_MESSAGES.EN.ROLE_NOT_FOUND);

    await role.update(req.body);
    res.json({ success: true, data: role });
  } catch (error) {
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

// DELETE
export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return response.errorMessageResponse(res,404, {}, HTTP_MESSAGES.EN.ROLE_NOT_FOUND);

    await role.destroy();
    console.log('Role deleted successfully',role);
     return response.successResponse(res, 200, {}, HTTP_MESSAGES.EN.DATA_DELETED_SUCCESS);
  } catch (error) {
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};
