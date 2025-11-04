import User from "./User.js";
import Role from "./Role.js";
import Customer from "./Customer.js";
import Course from "./Courses.js";
import Teacher from "./Teachers.js";
import Admission from "./Admission.js";
import Batches from "./Batches.js";
import Enquiry from "./Enquiry.js";
import Permission from "./Permission.js";
import FeeSetup from "./FeeSetup.js";
import Installment from "./Installment.js";
import Receipt from "./Receipt.js"; // ✅ Import added

// --------------------
// User associations
// --------------------
User.belongsTo(Role, { foreignKey: "role_id", as: "Role" });
User.belongsTo(Customer, { foreignKey: "customer_id", as: "Customer" });

Role.hasMany(User, { foreignKey: "role_id", as: "Users" });
Customer.hasMany(User, { foreignKey: "customer_id", as: "Users" });

Customer.hasMany(Role, { foreignKey: "customer_id", as: "Roles" });
Role.belongsTo(Customer, { foreignKey: "customer_id", as: "Customer" });

// --------------------
// Teacher <-> Course (many-to-many)
// --------------------
Course.belongsToMany(Teacher, {
  through: "CourseTeachers",
  foreignKey: "course_id",
  otherKey: "teacher_id",
  as: "teachers",
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
Admission.belongsTo(Batches, {
  as: "batch",
  foreignKey: "batch_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Batches.hasMany(Admission, {
  as: "admissions",
  foreignKey: "batch_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// --------------------
// ✅ Customer <-> Admission (SaaS linkage)
// --------------------
Customer.hasMany(Admission, { foreignKey: "customer_id", as: "Admissions" });
Admission.belongsTo(Customer, { foreignKey: "customer_id", as: "Customer" });

// --------------------
// User <-> Enquiry (Handled By)
// --------------------
User.hasMany(Enquiry, { foreignKey: "handled_by", as: "HandledEnquiries" });
Enquiry.belongsTo(User, { foreignKey: "handled_by", as: "HandledBy" });

// --------------------
// Customer <-> Enquiry (SaaS linkage)
// --------------------
Customer.hasMany(Enquiry, { foreignKey: "customer_id", as: "Enquiries" });
Enquiry.belongsTo(Customer, { foreignKey: "customer_id", as: "Customer" });

// --------------------
// Customer <-> Teacher (SaaS linkage)
// --------------------
Customer.hasMany(Teacher, { foreignKey: "customer_id", as: "Teachers" });
Teacher.belongsTo(Customer, { foreignKey: "customer_id", as: "Customer" });

// --------------------
// Customer <-> Course (SaaS linkage)
// --------------------
Customer.hasMany(Course, { foreignKey: "customer_id", as: "Courses" });
Course.belongsTo(Customer, { foreignKey: "customer_id", as: "Customer" });

// --------------------
// Customer <-> Batches (SaaS linkage)
// --------------------
Customer.hasMany(Batches, { foreignKey: "customer_id", as: "Batches" });
Batches.belongsTo(Customer, { foreignKey: "customer_id", as: "Customer" });

// --------------------
// Role <-> Permission
// --------------------
Role.hasMany(Permission, { foreignKey: "role_id", as: "Permissions" });
Permission.belongsTo(Role, { foreignKey: "role_id", as: "Role" });

Customer.hasMany(Permission, { foreignKey: "customer_id", as: "Permissions" });
Permission.belongsTo(Customer, { foreignKey: "customer_id", as: "Customer" });

// --------------------
// ✅ FeeSetup <-> Admission
// --------------------
Admission.hasMany(FeeSetup, {
  foreignKey: "admission_id",
  as: "fee_setup",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

FeeSetup.belongsTo(Admission, {
  foreignKey: "admission_id",
  as: "admission",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// --------------------
// ✅ FeeSetup <-> Customer
// --------------------
Customer.hasMany(FeeSetup, { foreignKey: "customer_id", as: "FeeSetups" });
FeeSetup.belongsTo(Customer, { foreignKey: "customer_id", as: "Customer" });

// --------------------
// ✅ FeeSetup <-> Installment
// --------------------
FeeSetup.hasMany(Installment, {
  foreignKey: "fee_id",
  as: "installments",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Installment.belongsTo(FeeSetup, {
  foreignKey: "fee_id",
  as: "fee_setup",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// --------------------
// ✅ FeeSetup <-> Batches
// --------------------
Batches.hasMany(FeeSetup, {
  foreignKey: "batch_id",
  as: "FeeSetups",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

FeeSetup.belongsTo(Batches, {
  foreignKey: "batch_id",
  as: "batch",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// --------------------
// ✅ Receipt <-> Installment / Admission / Customer
// --------------------
Receipt.belongsTo(Customer, {
  foreignKey: "customer_id",
  as: "Customer",
});

Receipt.belongsTo(Installment, {
  foreignKey: "installment_id",
  as: "Installment",
});

Receipt.belongsTo(Admission, {
  foreignKey: "admission_id",
  as: "Admission",
});

// ✅ Reverse associations
Customer.hasMany(Receipt, { foreignKey: "customer_id", as: "Receipts" });
Installment.hasMany(Receipt, { foreignKey: "installment_id", as: "Receipts" });
Admission.hasMany(Receipt, { foreignKey: "admission_id", as: "Receipts" });

// --------------------
// Export all models
// --------------------
const models = {
  User,
  Role,
  Customer,
  Enquiry,
  Course,
  Teacher,
  Admission,
  Batches,
  Permission,
  FeeSetup,
  Installment,
  Receipt, // ✅ Exported new model
};

export default models;
