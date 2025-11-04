"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Receipts", {
      receipt_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      // ✅ Customer foreign key (for SaaS multi-tenant setup)
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Customers", // your main customer table
          key: "customer_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL", // if a customer is deleted, receipts remain but are detached
      },

      installment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "installments",
          key: "installment_id",
        },
        onDelete: "CASCADE",
      },

      admission_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      receipt_no: {
        type: Sequelize.STRING(50),
        unique: true,
      },
      receipt_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW, // useful for report filters
      },

      received_by: {
        type: Sequelize.STRING(100),
        allowNull: true, // name of the cashier/admin generating the receipt
      },

      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      payment_mode: {
        type: Sequelize.ENUM("cash", "upi", "card", "bank_transfer"),
        defaultValue: "cash",
      },

      paid_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },

      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Receipts");
  },
};
