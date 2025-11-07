"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "status", {
      type: Sequelize.ENUM("active", "inactive", "suspended"),
      allowNull: true,
      defaultValue: "active",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "status");
  },
};
