"use strict";

const EventRequests = (sequelize, DataTypes) => {
  const EventRequest = sequelize.define(
    "event_requests",
    {
      requestId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        field: "request_id",
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
      },
      eventId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "event_id",
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
      },
      appliedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "applied_at",
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
      tableName: "event_requests",
      timestamps: true,
    }
  );

  EventRequest.associate = (models) => {
    EventRequest.belongsTo(models.users, {
      foreignKey: "user_id",
      as: "user",
    });
    EventRequest.belongsTo(models.events, {
      foreignKey: "event_id",
      as: "event",
    });
  };

  return EventRequest;
};

module.exports = EventRequests;
