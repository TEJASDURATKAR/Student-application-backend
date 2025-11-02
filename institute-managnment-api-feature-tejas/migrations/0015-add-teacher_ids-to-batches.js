"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("batches");

    if (!tableInfo.teacher_ids) {
      await queryInterface.addColumn("batches", "teacher_ids", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("batches", "teacher_ids");
  },
};
