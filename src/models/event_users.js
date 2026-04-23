"use strict";

const EventConfirmedUsers = (sequelize, DataTypes) => {
  const EventConfirmedUser = sequelize.define(
    "event_users",
    {
      confirmationId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        field: "confirmation_id",
      },
      eventId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "event_id",
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "role_id",
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "confirmed",
      },
      checkInTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "check_in_time",
      },
      checkOutTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "check_out_time",
      },
      rating: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      comments: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      attendanceStatus: {
        type: DataTypes.STRING,
        defaultValue: "not_marked",
        field: "attendance_status",
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
      tableName: "event_users",
      timestamps: true,
    }
  );

  EventConfirmedUser.associate = (models) => {
    EventConfirmedUser.belongsTo(models.users, {
      foreignKey: "user_id",
      as: "user",
    });
    EventConfirmedUser.belongsTo(models.events, {
      foreignKey: "event_id",
      as: "event",
    });
  };

  return EventConfirmedUser;
};

module.exports = EventConfirmedUsers;
