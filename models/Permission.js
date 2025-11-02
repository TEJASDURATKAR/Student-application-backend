import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";
import Role from "./Role.js";

const Permission = sequelize.define(
  "permissions",
  {
    permission_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Customers",
        key: "customer_id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },

    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "roles",
        key: "role_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    module_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    actions: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "permissions",
    timestamps: true,
  }
);

// 🔗 Associations
Role.hasMany(Permission, { foreignKey: "role_id", onDelete: "CASCADE" });
Permission.belongsTo(Role, { foreignKey: "role_id" });

export default Permission;
