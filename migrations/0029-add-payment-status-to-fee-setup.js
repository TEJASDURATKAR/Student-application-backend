"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("fee_setups", "payment_status", {
      type: Sequelize.ENUM("pending", "paid"),
      allowNull: false,
      defaultValue: "pending",
      after: "advance_money", // optional (MySQL only)
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("fee_setups", "payment_status");
  },
};
