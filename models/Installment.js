import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";

const Installment = sequelize.define(
  "Installment",
  {
    installment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    fee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "fee_setups", // ✅ matches tableName exactly
        key: "fee_id",
      },

      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    installment_due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    paid_date: {
      type: DataTypes.DATE,
      allowNull: true, // optional, since payment may not be done yet
      },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "paid", "overdue"),
      defaultValue: "pending",
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
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "installments",
    timestamps: true,
  },
);

export default Installment;
