const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");
const Batches = require("./Batches");


const Admission = sequelize.define(
  "Admissions",
  {
    admission_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    student_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    student_email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    student_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    batch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "batches", // ✅ table name in DB (lowercase)
        key: "batch_id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    admission_date: {
      type: DataTypes.DATE,
      allowNull: false,
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
  },
  {
    timestamps: true,
    tableName: "admissions", // ✅ lowercase to match DB table naming
  }
);


module.exports = Admission;
