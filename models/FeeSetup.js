const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const FeeSetup = sequelize.define(
  "FeeSetup",
  {
    fee_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    admission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "admissions", // ✅ lowercase (table name)
        key: "admission_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    batch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "batches", // ✅ lowercase (table name)
        key: "batch_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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

    total_fee: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    discount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    payable_fee: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    advance_money: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },

    payment_type: {
      type: DataTypes.ENUM("full", "installment"),
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
  },
  {
    tableName: "fee_setups",
    timestamps: true,
  },
);

module.exports = FeeSetup;
