"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("FeeSetups", {
      fee_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      admission_id: {
  type: Sequelize.INTEGER,
  allowNull: false,
  references: {
    model: "admissions", // ✅ lowercase
    key: "admission_id", // ✅ match your admissions model key
  },
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
}
,
batch_id: {
  type: Sequelize.INTEGER,
  allowNull: false,
  references: {
    model: "batches", // ✅ lowercase
    key: "batch_id",
  },
},
customer_id: {
  type: Sequelize.INTEGER,
  allowNull: true,
  references: {
    model: "customers", // ✅ lowercase
    key: "customer_id",
  },
},

      total_fee: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      discount: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      payable_fee: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
    await queryInterface.dropTable("FeeSetups");
  },
};
