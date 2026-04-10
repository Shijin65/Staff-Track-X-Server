"use strict";

const Addresses = (sequelize, DataTypes) => {
  const Address = sequelize.define(
    "user_address",
    {
      addressId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        field: "address_id",
      },

      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
      },

      address: {
        type: DataTypes.TEXT,
      },

      state: {
        type: DataTypes.STRING,
      },

      district: {
        type: DataTypes.STRING,
      },

      city: {
        type: DataTypes.STRING,
      },

      bloodGroup: {
        type: DataTypes.STRING,
        field: "blood_group",
      },

      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: "created_at",
      },

      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: "updated_at",
      },
    },
    {
      tableName: "user_address",
      timestamps: true,
    }
  );

  Address.associate = (models) => {
    Address.belongsTo(models.users, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return Address;
};

module.exports = Addresses;
