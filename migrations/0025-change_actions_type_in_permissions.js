"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Convert existing text column to JSON safely
    await queryInterface.sequelize.query(`
      ALTER TABLE "permissions"
      ALTER COLUMN "actions" TYPE JSON USING actions::json;
    `);
    // Make it NOT NULL if needed
    await queryInterface.sequelize.query(`
      ALTER TABLE "permissions"
      ALTER COLUMN "actions" SET NOT NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Convert back to TEXT
    await queryInterface.sequelize.query(`
      ALTER TABLE "permissions"
      ALTER COLUMN "actions" TYPE TEXT;
    `);
  },
};
