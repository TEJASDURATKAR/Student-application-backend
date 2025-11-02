const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const Enquiry = sequelize.define(
  "Enquiries",
  {
    enquiry_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50], // Ensures name is between 2-50 characters
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
      },
    },
    course_intrested: {
      // Changed to camelCase
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "How they heard about us",
      validate: {
        notEmpty: true,
      },
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
    status: {
      type: DataTypes.ENUM(
        "new",
        "contacted",
        "followup",
        "converted",
        "rejected",
      ),
      defaultValue: "new",
      allowNull: false,
    },
    followup_date: {
      // Changed to camelCase
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    handled_by: {
      // Changed to camelCase
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "user_id", // Changed to match userId in Users model
      },
    },
  },
  {
    timestamps: true, // Automatically handles createdAt and updatedAt
  },
);

module.exports = Enquiry;
