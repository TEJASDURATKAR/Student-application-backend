const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const Student = sequelize.define("Students", {
       student_id: {
              type: DataTypes.INTEGER,
              primaryKey: true,
              autoIncrement: true,
              allowNull: false
       },
       user_id: {
              type: DataTypes.INTEGER,
              allowNull: true,
              unique: true,
              references: {
                     model: "Users",
                     key: "userId"
              }
       },
       admission_number: {
              type: DataTypes.STRING(20),
              allowNull: false,
              unique: true
       },
       first_name: {
              type: DataTypes.STRING(50),
              allowNull: false,
       },
       last_name: {
              type: DataTypes.STRING(50),
              allowNull: false,
       },
       date_of_birth: {
              type: DataTypes.DATEONLY,
              allowNull: false,
       },
       gender: {
              type: DataTypes.ENUM('male', 'female', 'other'), // Better than STRING with values
              allowNull: true
       },
       address: {
              type: DataTypes.TEXT,
              allowNull: true
       },
       city: {
              type: DataTypes.STRING(50),
              allowNull: true
       },
       state: {
              type: DataTypes.STRING(50),
              allowNull: true
       },
       country: {
              type: DataTypes.STRING(50),
              allowNull: true
       },
       postal_code: {
              type: DataTypes.STRING(20),
              allowNull: true,
       },
       parent_name: {
              type: DataTypes.STRING(100),
              allowNull: true
       },
       parent_phone: {
              type: DataTypes.STRING(20),
              allowNull: true,
       },
       parent_email: {
              type: DataTypes.STRING(100),
              allowNull: true,
       },
       admission_date: {
              type: DataTypes.DATEONLY,
              allowNull: false,
       },
       status: {
              type: DataTypes.ENUM('active', 'inactive', 'completed', 'suspended'),
              defaultValue: "active",
              allowNull: false
       },
       photo_url: {
              type: DataTypes.STRING(255),
              allowNull: true,
              validate: {
                     isUrl: true
              }
       }
}, {
       timestamps: true, // Automatically manages createdAt and updatedAt
});

module.exports = Student;