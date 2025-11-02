'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Courses', 'course_code', {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
    });

    await queryInterface.changeColumn('Courses', 'teacher_ids', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Courses', 'course_code', {
      type: Sequelize.STRING(20),
      allowNull: false,
      unique: true,
    });

    await queryInterface.changeColumn('Courses', 'teacher_ids', {
      type: Sequelize.STRING(255), // previous type
      allowNull: true,
    });
  }
};
