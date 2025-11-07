import { DataTypes } from "sequelize";
const { sequelize } = require("../config/db.config");

const Role = sequelize.define("roles", {
  role_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  role_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Customers", // table name (not model name)
        key: "customer_id",
      },
    },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
    // ✅ Add status column
  status: {
    type: DataTypes.ENUM("active", "inactive", "suspended"),
    allowNull: false,
    defaultValue: "active",
  },

       // ✅ Add soft delete / active flags
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
});

export default Role;
