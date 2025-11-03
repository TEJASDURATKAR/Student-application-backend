"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Installments", {
      installment_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "FeeSetups", // ✅ linked correctly
          key: "fee_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      installment_no: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      // ✅ Added: Paid date field
      paid_date: {
        type: Sequelize.DATE,
        allowNull: true, // optional, since payment may not be done yet
      },

      payment_status: {
        type: Sequelize.ENUM("pending", "paid"),
        defaultValue: "pending",
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Installments");
  },
};
