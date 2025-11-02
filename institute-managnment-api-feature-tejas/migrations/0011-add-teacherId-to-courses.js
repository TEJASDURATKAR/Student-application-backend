"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Courses", "teacher_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Teachers",
        key: "teacher_id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Courses", "teacher_id");
  }
};
