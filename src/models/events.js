"use strict";

const Events = (sequelize, DataTypes) => {
  const Event = sequelize.define(
    "events",
    {
      eventId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        field: "event_id",
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      eventVenue: {
        type: DataTypes.STRING,
        field: "event_venue",
      },
      eventType: {
        type: DataTypes.STRING,
        field: "event_type",
      },
      eventDate: {
        type: DataTypes.DATEONLY,
        field: "event_date",
      },
      reportingTime: {
        type: DataTypes.STRING,
        field: "reporting_time",
      },
      startTime: {
        type: DataTypes.STRING,
        field: "start_time",
      },
      clientName: {
        type: DataTypes.STRING,
        field: "client_name",
      },
      clientPhone: {
        type: DataTypes.STRING,
        field: "client_phone",
      },
      address: {
        type: DataTypes.STRING,
      },
      district: {
        type: DataTypes.STRING,
      },
      city: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "Pending",
      },
      description: {
        type: DataTypes.TEXT,
      },
      locationInstructions: {
        type: DataTypes.TEXT,
        field: "location_instructions",
      },
      longitude: {
        type: DataTypes.FLOAT,
      },
      latitude: {
        type: DataTypes.FLOAT,
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
      tableName: "events",
      timestamps: true,
    }
  );

  Event.associate = (models) => {
    Event.hasMany(models.event_staff_requirements, {
      foreignKey: "event_id",
      as: "staffRequirements",
    });
  };

  return Event;
};

module.exports = Events;
