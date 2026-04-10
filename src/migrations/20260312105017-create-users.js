"use strict";

const { SUPER_ADMIN_UID, SUPER_ADMIN_ROLE_ID } = require('../constants/valueConstant');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            // Create users table
            await queryInterface.createTable(
                "users",
                {
                    user_id: {
                        type: Sequelize.UUID,
                        defaultValue: Sequelize.UUIDV4,
                        primaryKey: true,
                        allowNull: false,
                    },
                    role_id: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                    },
                    first_name: {
                        type: Sequelize.STRING,
                        allowNull: false,
                    },
                    last_name: {
                        type: Sequelize.STRING,
                    },
                    mobile_number: {
                        type: Sequelize.STRING,
                    },
                    email: {
                        type: Sequelize.STRING,
                        unique: true,
                        allowNull: false,
                    },
                    password: {
                        type: Sequelize.STRING,
                    },
                    temp_password: {
                        type: Sequelize.STRING,
                        allowNull: true,
                    },
                    gender: {
                        type: Sequelize.STRING,
                    },
                    rating: {
                        type: Sequelize.FLOAT,
                    },
                    is_active: {
                        type: Sequelize.BOOLEAN,
                        allowNull: false,
                        defaultValue: true,
                    },
                    is_mail_send: {
                        type: Sequelize.BOOLEAN,
                        defaultValue: false,
                    },
                    profile_updated: {
                        type: Sequelize.BOOLEAN,
                        defaultValue: false,
                    },
                    experience: {
                        type: Sequelize.STRING,
                    },
                    verification: {
                        type: Sequelize.STRING,
                    },
                    emergency_contact: {
                        type: Sequelize.STRING,
                    },
                    is_super_admin: {
                        type: Sequelize.BOOLEAN,
                        allowNull: false,
                        defaultValue: false,
                    },
                    is_email_link_used: {
                        type: Sequelize.BOOLEAN,
                        defaultValue: false,
                    },
                    token_invalid_date_time: {
                        type: Sequelize.DATE,
                    },
                    created_at: {
                        type: Sequelize.DATE,
                        allowNull: false,
                        defaultValue: Sequelize.NOW,
                    },
                    updated_at: {
                        type: Sequelize.DATE,
                        allowNull: false,
                        defaultValue: Sequelize.NOW,
                    },
                },
                { transaction },
            );

            // Create addresses table
            await queryInterface.createTable(
                "user_address",
                {
                    address_id: {
                        type: Sequelize.UUID,
                        defaultValue: Sequelize.UUIDV4,
                        primaryKey: true,
                        allowNull: false,
                    },
                    user_id: {
                        type: Sequelize.UUID,
                        allowNull: false,
                        references: {
                            model: "users",
                            key: "user_id",
                        },
                        onUpdate: "CASCADE",
                        onDelete: "CASCADE",
                    },
                    address: {
                        type: Sequelize.TEXT,
                    },
                    state: {
                        type: Sequelize.STRING,
                    },
                    district: {
                        type: Sequelize.STRING,
                    },
                    city: {
                        type: Sequelize.STRING,
                    },
                    blood_group: {
                        type: Sequelize.STRING,
                    },
                    created_at: {
                        type: Sequelize.DATE,
                        allowNull: false,
                        defaultValue: Sequelize.NOW,
                    },
                    updated_at: {
                        type: Sequelize.DATE,
                        allowNull: false,
                        defaultValue: Sequelize.NOW,
                    },
                },
                { transaction },
            );


            // Insert Super Admin user
            await queryInterface.bulkInsert(
                "users",
                [
                    {
                        user_id: SUPER_ADMIN_UID,
                        role_id: SUPER_ADMIN_ROLE_ID,
                        first_name: "Super",
                        last_name: "Admin",
                        mobile_number: "1234567890",
                        email: "admin@base.com",
                        password: "T9!vK2#xQ7@Lm5$R",
                        gender: "male",
                        is_super_admin: true,
                        is_active: true,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                ],
                { transaction },
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.dropTable("user_address", { transaction });
            await queryInterface.dropTable("users", { transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};
