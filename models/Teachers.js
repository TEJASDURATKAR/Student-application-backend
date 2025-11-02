import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";

const Teacher = sequelize.define("Teachers", {
  teacher_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Customers", // table name (not model name)
        key: "customer_id",
      },
    },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  specialization: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

// Associations defined in index.js

export default Teacher;
