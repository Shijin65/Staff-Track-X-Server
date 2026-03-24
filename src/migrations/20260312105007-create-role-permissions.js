"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("role_permissions", {
            role_permission_id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },

            role_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "user_roles",
                    key: "role_id",
                },
                onDelete: "CASCADE",
            },

            permission_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "permissions",
                    key: "permission_id",
                },
                onDelete: "CASCADE",
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
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("role_permissions");
    },
};
