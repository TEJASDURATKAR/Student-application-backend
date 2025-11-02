"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("fee_setups", "advance_money", {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
      after: "payable_fee", // optional: depends on your DB
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("fee_setups", "advance_money");
  },
};
