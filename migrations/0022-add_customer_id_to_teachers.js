"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Teachers", "customer_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Customers",
        key: "customer_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      after: "teacher_id",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Teachers", "customer_id");
  },
};
