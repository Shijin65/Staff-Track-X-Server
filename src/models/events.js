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
    address: {
      type: Sequelize.TEXT,
    },
    district: {
      type: Sequelize.STRING,
    },  
    city: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: "Pending",
    },
    description: {
      type: Sequelize.TEXT,
    },
    locationInstructions: {
      type: Sequelize.TEXT,
    },
    longitude: {
      type: Sequelize.STRING,
    },
    latitude: {
      type: Sequelize.STRING,
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
