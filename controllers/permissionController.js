import models from "../models/index.js";
import response from "../const/response.js";
import { HTTP_MESSAGES } from "../const/message.js";
import { sequelize } from "../config/db.config.js";

const { Permission, Customer, Role } = models;

/**
 * ✅ CREATE PERMISSION
 */
export const createPermission = async (req, res) => {
  try {
    const { role_id, module_name, actions } = req.body;
    const customer_id = req.user?.customer_id;

    if (!customer_id) {
      return response.errorMessageResponse(res, 400, {}, "customer_id is required");
    }

    if (!role_id || !module_name || !actions) {
      return response.errorMessageResponse(
        res,
        400,
        {},
        HTTP_MESSAGES.EN.ALL_FEILEDS_REQUIRED
      );
    }

    const permission = await Permission.create({
      customer_id,
      role_id,
      module_name,
      actions,
      is_active: true,
      is_deleted: false,
    });

    return response.successResponse(
      res,
      200,
      permission,
      HTTP_MESSAGES.EN.DATA_ADDED_SUCCESS
    );
  } catch (error) {
    console.error("❌ Create Permission Error:", error);
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

/**
 * ✅ GET ALL PERMISSIONS (Scoped by customer_id)
 */
export const getAllPermissions = async (req, res) => {
  try {
    const customer_id = req.user?.customer_id;
    if (!customer_id) return response.errorMessageResponse(res, 400, {}, "customer_id is required");

    const permissions = await Permission.findAll({
      where: { customer_id, is_deleted: false },
      include: [
        { model: Role, as: "Role" },
        { model: Customer, as: "Customer", attributes: ["customer_id", "companyName"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    return response.successResponse(res, 200, permissions, "Permissions fetched successfully");
  } catch (error) {
    console.error("❌ Get All Permissions Error:", error);
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

/**
 * ✅ GET PERMISSION BY ID
 */
export const getPermissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.user?.customer_id;
    if (!customer_id) return response.errorMessageResponse(res, 400, {}, "customer_id is required");

    const permission = await Permission.findOne({
      where: { permission_id: id, customer_id, is_deleted: false },
      include: [
        { model: Role, as: "Role" },
        { model: Customer, as: "Customer", attributes: ["customer_id", "companyName"] },
      ],
    });

    if (!permission) return response.errorMessageResponse(res, 404, {}, HTTP_MESSAGES.EN.DATA_NOT_FOUND);

    return response.successResponse(res, 200, permission, "Permission fetched successfully");
  } catch (error) {
    console.error("❌ Get Permission Error:", error);
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

/**
 * ✅ UPDATE PERMISSION
 */
export const updatePermission = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { role_id, module_name, actions, is_active } = req.body;
    const customer_id = req.user?.customer_id;

    if (!customer_id) return response.errorMessageResponse(res, 400, {}, "customer_id is required");

    if (!role_id || !module_name || !actions) {
      return response.errorMessageResponse(res, 400, {}, HTTP_MESSAGES.EN.ALL_FEILEDS_REQUIRED);
    }

    const existingPermission = await Permission.findOne({
      where: { permission_id: id, customer_id, is_deleted: false },
      transaction: t,
    });

    if (!existingPermission) {
      await t.rollback();
      return response.errorMessageResponse(res, 404, {}, HTTP_MESSAGES.EN.DATA_NOT_FOUND);
    }

    await existingPermission.update(
      { role_id, module_name, actions, is_active },
      { transaction: t }
    );

    await t.commit();

    return response.successResponse(res, 200, existingPermission, HTTP_MESSAGES.EN.DATA_UPDATED_SUCCESS);
  } catch (error) {
    await t.rollback();
    console.error("❌ Update Permission Error:", error);
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

/**
 * ✅ DELETE PERMISSION (soft delete)
 */
export const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.user?.customer_id;
    if (!customer_id) return response.errorMessageResponse(res, 400, {}, "customer_id is required");

    const permission = await Permission.findOne({
      where: { permission_id: id, customer_id, is_active: true, is_deleted: false },
    });

    if (!permission) return response.errorMessageResponse(res, 404, {}, HTTP_MESSAGES.EN.DATA_NOT_FOUND);

    await permission.update({ is_deleted: true, is_active: false });

    return response.successResponse(res, 200, {}, HTTP_MESSAGES.EN.DATA_DELETED_SUCCESS);
  } catch (error) {
    console.error("❌ Delete Permission Error:", error);
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};
