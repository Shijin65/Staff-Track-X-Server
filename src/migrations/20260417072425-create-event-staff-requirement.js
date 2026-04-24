'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('event_staff_requirements', {
        requirement_id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4
        },
        event_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        role_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        count: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('event_staff_requirements');
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};