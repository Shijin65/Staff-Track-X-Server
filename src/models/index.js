"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const { logger } = require("../config/loggerConfig");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(path.resolve(__dirname, "../config/config.js"))[env];
const db = {};

let sequelize;

// Initialize Sequelize based on the environment configuration
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], {
    ...config,
    logging: false,
  });
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, {
    ...config,
    logging: false,
  });
}

// Verify database connection
(async () => {
  try {
    await sequelize.authenticate();
  } catch (err) {
    logger.error(`Failed to connect to the database: ${err.message}`);
    process.exit(1); // Exit process with failure code
  }
})();

// Dynamically import models from the current directory
fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Set up associations between models if defined
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Add sequelize instance and Sequelize library to the db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Gracefully handle app shutdown and close the database connection
const handleAppExit = async (signal) => {
  logger.info(`Received ${signal}. Closing Sequelize connection...`);
  try {
    await sequelize.close();
    logger.info("Sequelize connection closed successfully.");
    process.exit(0); // Exit gracefully
  } catch (err) {
    logger.error(`Error while closing Sequelize connection:, ${err.message}`);
    process.exit(1); // Exit with error
  }
};

// Handle process termination signals
process.on("SIGINT", handleAppExit); // On Ctrl+C
process.on("SIGTERM", handleAppExit); // On server termination
process.on('SIGUSR2', handleAppExit); // On Nodemon 

module.exports = db;
