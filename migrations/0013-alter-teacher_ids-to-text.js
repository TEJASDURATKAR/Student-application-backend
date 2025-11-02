'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Courses', 'teacher_ids', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Courses', 'teacher_ids', {
      type: Sequelize.STRING(20), // previous type
      allowNull: true,
    });
  }
};
