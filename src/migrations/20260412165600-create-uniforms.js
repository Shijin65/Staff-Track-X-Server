"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Create user_uniforms table
            await queryInterface.createTable(
                "user_uniforms",
                {
                    id: {
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
                    white_shirt: {
                        type: Sequelize.BOOLEAN,
                        defaultValue: false,
                    },
                    black_pant: {
                        type: Sequelize.BOOLEAN,
                        defaultValue: false,
                    },
                    executive_black_shoe: {
                        type: Sequelize.BOOLEAN,
                        defaultValue: false,
                    },
                    grooming: {
                        type: Sequelize.BOOLEAN,
                        defaultValue: false,
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
                { transaction }
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
            await queryInterface.dropTable("user_uniforms", { transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};
