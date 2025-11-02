'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Enquiries', 'customer_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // 👈 allow null for now
      references: {
        model: 'Customers',
        key: 'customer_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Enquiries', 'customer_id');
  },
};
