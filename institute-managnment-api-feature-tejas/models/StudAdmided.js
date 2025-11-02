const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const StudAddmited = sequelize.define(
  "StudentAdmissions",
  {
    admission_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Students",
        key: "student_id",
      },
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Courses",
        key: "course_id",
      },
    },
    batch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Batches",
        key: "batch_id",
      },
    },
    admission_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "partial", "completed"),
      defaultValue: "pending",
    },
    status: {
      type: DataTypes.ENUM("active", "withdrawn", "completed"),
      defaultValue: "active",
      allowNull: false,
    },
    // ✅ Add soft delete / active flags
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "user_id",
      },
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  },
);

module.exports = StudAddmited;
