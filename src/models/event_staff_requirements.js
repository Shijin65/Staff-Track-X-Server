"use strict";

const EventStaffRequirements = (sequelize, DataTypes) => {
  const EventStaffRequirement = sequelize.define(
    "event_staff_requirements",
    {
      requirementId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        field: "requirement_id",
      },
      eventId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "event_id",
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "role_id",
      },
      count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
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
      tableName: "event_staff_requirements",
      timestamps: true,
    }
  );

  EventStaffRequirement.associate = (models) => {
    EventStaffRequirement.belongsTo(models.events, {
      foreignKey: "event_id",
      as: "event",
    });
  };

  return EventStaffRequirement;
};

module.exports = EventStaffRequirements;
