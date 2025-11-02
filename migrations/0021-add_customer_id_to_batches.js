"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("batches", "customer_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Customers",
        key: "customer_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      after: "batch_id",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("batches", "customer_id");
  },
};
