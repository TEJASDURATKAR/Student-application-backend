import models from "../models/index.js";
import response from "../const/response.js";
import { HTTP_MESSAGES } from "../const/message.js";
import { sequelize } from "../config/db.config.js";

const { Role, Customer, Permission } = models;

/**
 * ✅ CREATE ROLE WITH PERMISSIONS
 */
export const createRole = async (req, res) => {
  try {
    const { role_name, role } = req.body;
    const customer_id = req.user?.customer_id;

    if (!customer_id) {
      return response.errorMessageResponse(res, 400, {}, "customer_id is required");
    }

    if (!role_name || !role ) {
      return response.errorMessageResponse(
        res,
        400,
        {},
        HTTP_MESSAGES.EN.ALL_FEILEDS_REQUIRED
      );
    }

    // ✅ Create the Role first
    const newRole = await Role.create({
      role_name,
      role,
      customer_id,
      is_active: true,
      is_deleted: false,
    });

  
    return response.successResponse(
      res,
      200,
      { role: newRole },
      HTTP_MESSAGES.EN.DATA_ADDED_SUCCESS
    );
  } catch (error) {
    console.error("❌ Create Role Error:", error);
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

/**
 * ✅ GET ALL ROLES WITH PERMISSIONS
 */
export const getAllRoles = async (req, res) => {
  try {
    const customer_id = req.user?.customer_id;
    if (!customer_id) return response.errorMessageResponse(res, 400, {}, "customer_id is required");

    const roles = await Role.findAll({
      where: { customer_id, is_active: true, is_deleted: false },
      include: [
        { model: Permission, as: "Permissions" },
        { model: Customer, as: "Customer", attributes: ["customer_id", "companyName"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    return response.successResponse(res, 200, roles, "Roles fetched successfully");
  } catch (error) {
    console.error("❌ Get All Roles Error:", error);
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

/**
 * ✅ GET ROLE BY ID WITH PERMISSIONS
 */
export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.user?.customer_id;
    if (!customer_id) return response.errorMessageResponse(res, 400, {}, "customer_id is required");

    const role = await Role.findOne({
      where: { role_id: id, customer_id, is_active: true, is_deleted: false },
      include: [
        { model: Permission, as: "Permissions" },
        { model: Customer, as: "Customer", attributes: ["customer_id", "companyName"] },
      ],
    });

    if (!role) return response.errorMessageResponse(res, 404, {}, HTTP_MESSAGES.EN.ROLE_NOT_FOUND);

    return response.successResponse(res, 200, role, "Role fetched successfully");
  } catch (error) {
    console.error("❌ Get Role Error:", error);
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};

/**
 * ✅ UPDATE ROLE AND PERMISSIONS
 */
export const updateRole = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { role_name, role, permission } = req.body;
    const customer_id = req.user?.customer_id;

    if (!customer_id)
      return response.errorMessageResponse(res, 400, {}, "customer_id is required");

    if (!role_name || !role || !permission) {
      return response.errorMessageResponse(
        res,
        400,
        {},
        HTTP_MESSAGES.EN.ALL_FEILEDS_REQUIRED
      );
    }

    // ✅ Step 1: Find existing role
    const existingRole = await Role.findOne({
      where: { role_id: id, customer_id, is_deleted: false },
      transaction: t,
    });

    if (!existingRole) {
      await t.rollback();
      return response.errorMessageResponse(res, 404, {}, HTTP_MESSAGES.EN.ROLE_NOT_FOUND);
    }

    // ✅ Step 2: Update the role name and code
    await existingRole.update(
      {
        role_name,
        role,
        updatedAt: new Date(),
      },
      { transaction: t }
    );

    // ✅ Step 3: Delete old permissions
    await Permission.destroy({
      where: { role_id: id, customer_id },
      transaction: t,
    });

    // ✅ Step 4: Insert new permissions
    // (keeping the same object → array mapping as createRole)
    const permissionArray = Object.entries(permission).map(([module_name, actions]) => ({
      module_name,
      actions,
      customer_id,
      role_id: existingRole.role_id,
      is_active: true,
      is_deleted: false,
    }));

    await Permission.bulkCreate(permissionArray, { transaction: t });

    await t.commit();

    // ✅ Step 5: Fetch updated role with permissions
    const updatedRole = await Role.findOne({
      where: { role_id: id },
      include: [{ model: Permission, as: "Permissions" }],
    });

    return response.successResponse(
      res,
      200,
      { role: updatedRole },
      HTTP_MESSAGES.EN.DATA_UPDATED_SUCCESS
    );
  } catch (error) {
    await t.rollback();
    console.error("❌ Update Role Error:", error);
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};


/**
 * ✅ DELETE ROLE (Scoped by customer_id)
 */
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const customer_id = req.user?.customer_id;
    if (!customer_id) return response.errorMessageResponse(res, 400, {}, "customer_id is required");

    const role = await Role.findOne({
      where: { role_id: id, customer_id, is_active: true, is_deleted: false },
    });
    if (!role) return response.errorMessageResponse(res, 404, {}, HTTP_MESSAGES.EN.ROLE_NOT_FOUND);

    await role.update({ is_deleted: true, is_active: false });

    // Optionally, soft-delete related permissions
    await Permission.update({ is_deleted: true, is_active: false }, { where: { role_id: id } });

    return response.successResponse(res, 200, {}, HTTP_MESSAGES.EN.DATA_DELETED_SUCCESS);
  } catch (error) {
    console.error("❌ Delete Role Error:", error);
    return response.errorMessageResponse(res, 500, {}, HTTP_MESSAGES.EN.SERVER_ERROR);
  }
};