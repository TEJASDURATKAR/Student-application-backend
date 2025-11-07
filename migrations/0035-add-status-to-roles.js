"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("roles", "status", {
      type: Sequelize.ENUM("active", "inactive", "suspended"),
      allowNull: true,
      defaultValue: "active",
      after: "role" // optional: places it after the "role" column
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove column first
    await queryInterface.removeColumn("roles", "status");

    // Drop ENUM type to avoid conflicts in future migrations
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_roles_status";');
  },
};
