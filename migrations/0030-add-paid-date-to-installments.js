"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Installments", "paid_date", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "due_date", // places it right after due_date
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Installments", "paid_date");
  },
};
