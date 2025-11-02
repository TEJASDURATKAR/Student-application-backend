"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("roles", "customer_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Customers", // ✅ exact table name
        key: "customer_id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("roles", "customer_id");
  }
};
