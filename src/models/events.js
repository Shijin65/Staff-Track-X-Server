module.exports = (sequelize, Sequelize) => {
  const Event = sequelize.define("events", {
    eventId: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    eventVenue: {
      type: Sequelize.STRING,
    },
    eventType: {
      type: Sequelize.STRING,
    },
    eventDate: {
      type: Sequelize.DATEONLY,
    },
    startTime: {
      type: Sequelize.TIME,
    },
    endTime: {
      type: Sequelize.TIME,
    },
    clientName: {
      type: Sequelize.STRING,
    },
    clientPhone: {
      type: Sequelize.STRING,
    },
    clientEmail: {
      type: Sequelize.STRING,
    },
    address: {
      type: Sequelize.TEXT,
    },
    city: {
      type: Sequelize.STRING,
    },
    pincode: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: "Pending", // Pending, Confirmed, Completed, Cancelled
    },
    notes: {
      type: Sequelize.TEXT,
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  });

  return Event;
};
