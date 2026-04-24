"use strict";

const Uniforms = (sequelize, DataTypes) => {
  const Uniform = sequelize.define(
    "user_uniforms",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
      },
      whiteShirt: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "white_shirt",
      },
      blackPant: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "black_pant",
      },
      executiveBlackShoe: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "executive_black_shoe",
      },
      grooming: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "grooming",
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
      tableName: "user_uniforms",
      timestamps: true,
    }
  );

  Uniform.associate = (models) => {
    Uniform.belongsTo(models.users, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return Uniform;
};

module.exports = Uniforms;
