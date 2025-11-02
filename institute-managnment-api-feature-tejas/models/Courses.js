import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";

const Course = sequelize.define("Courses", {
  course_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  course_code: {
  type: DataTypes.STRING(50), // 50 chars
  allowNull: false,
  unique: true,
}
,
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  teacher_ids: {
    type: DataTypes.TEXT, // store JSON string
    allowNull: true,
    get() {
      const rawValue = this.getDataValue("teacher_ids");
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue("teacher_ids", JSON.stringify(value));
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
});

export default Course;
