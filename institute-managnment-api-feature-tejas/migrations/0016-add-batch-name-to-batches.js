"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Add column as nullable with a default value
    await queryInterface.addColumn("batches", "batch_name", {
      type: Sequelize.STRING(100),
      allowNull: true, // ✅ temporarily allow null
      defaultValue: "Unnamed Batch", // ✅ fill existing rows to avoid NULL errors
      after: "batch_code",
    });

    // Step 2 (optional): Remove the default value if you want
    // await queryInterface.changeColumn("batches", "batch_name", {
    //   type: Sequelize.STRING(100),
    //   allowNull: false,
    // });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("batches", "batch_name");
  },
};
