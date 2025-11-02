import User from "./User.js";
import Role from "./Role.js";
import Customer from "./Customer.js";
import Course from "./Courses.js";
import Teacher from "./Teachers.js";
import Admission from "./Admission.js";
import Batches from "./Batches.js";

// --------------------
// User associations
// --------------------
User.belongsTo(Role, { foreignKey: "role_id", as: "Role" });
User.belongsTo(Customer, { foreignKey: "customer_id", as: "Customer" });

Role.hasMany(User, { foreignKey: "role_id", as: "Users" });
Customer.hasMany(User, { foreignKey: "customer_id", as: "Users" });

// --------------------
// Teacher <-> Course (many-to-many)
// --------------------
// Teacher <-> Course (many-to-many)
Course.belongsToMany(Teacher, {
  through: "CourseTeachers", // Join table
  foreignKey: "course_id",
  otherKey: "teacher_id",
  as: "teachers", // this alias must match the include
});

Teacher.belongsToMany(Course, {
  through: "CourseTeachers",
  foreignKey: "teacher_id",
  otherKey: "course_id",
  as: "courses",
});

// --------------------
// Course <-> Batches
// --------------------
Course.hasMany(Batches, { foreignKey: "course_id", as: "batches" });
Batches.belongsTo(Course, { foreignKey: "course_id", as: "course" });

// --------------------
// Batch <-> Admission
// --------------------
Admission.belongsTo(Batches, { as: "batch", foreignKey: "batch_id" });
Batches.hasMany(Admission, { as: "admissions", foreignKey: "batch_id" });

// --------------------
// Export all models
// --------------------
const models = { User, Role, Customer, Course, Teacher, Admission, Batches };
export default models;
