'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('events', {
        event_id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false
        },
        event_venue: {
          type: Sequelize.STRING
        },
        event_type: {
          type: Sequelize.STRING
        },
        event_date: {
          type: Sequelize.DATEONLY
        },
        reporting_time: {
          type: Sequelize.STRING
        },
        start_time: {
          type: Sequelize.STRING
        },
        client_name: {
          type: Sequelize.STRING
        },
        client_phone: {
          type: Sequelize.STRING
        },
        city: {
          type: Sequelize.STRING
        },
        district: {
          type: Sequelize.STRING
        },
        state: {
          type: Sequelize.STRING
        },
        pincode: {
          type: Sequelize.STRING
        },
        country: {
          type: Sequelize.STRING
        },
        address: {
          type: Sequelize.STRING
        },
        status: {
          type: Sequelize.STRING,
          defaultValue: 'Pending'
        },
        description: {
          type: Sequelize.TEXT
        },
        location_instructions: {
          type: Sequelize.TEXT
        },
        longitude: {
          type: Sequelize.FLOAT
        },
        latitude: {
          type: Sequelize.FLOAT
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
      await queryInterface.dropTable('events');
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};