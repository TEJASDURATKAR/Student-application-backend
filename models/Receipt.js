import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";

const Receipt = sequelize.define(
  "Receipt",
  {
    receipt_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    installment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    admission_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    receipt_no: {
      type: DataTypes.STRING(50),
      unique: true,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    payment_mode: {
      type: DataTypes.ENUM("cash", "upi", "card", "bank_transfer"),
      defaultValue: "cash",
    },

    paid_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Receipts",
    timestamps: false, // ✅ You already have manual timestamps
  }
);

export default Receipt;
