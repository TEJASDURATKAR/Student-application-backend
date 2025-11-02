"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("roles", {
      role_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "customers", // lowercase table name
          key: "customer_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      role_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      role: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },

      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("roles");
  },
};
