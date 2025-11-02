'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Admissions', 'customer_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // 👈 allow null for now to avoid errors on existing rows
      references: {
        model: 'Customers', // Make sure this matches your table name
        key: 'customer_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Admissions', 'customer_id');
  },
};
