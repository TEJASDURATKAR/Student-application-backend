const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const Batches = sequelize.define(
  "batches",
  {
    batch_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    batch_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    batch_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Courses",
        key: "course_id",
      },
    },
    teacher_ids: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("teacher_ids");
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue("teacher_ids", JSON.stringify(value));
      },
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    max_students: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    current_students: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "active",
      allowNull: false,
      validate: {
        isIn: [["active", "inactive", "completed", "suspended"]],
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Batches;
