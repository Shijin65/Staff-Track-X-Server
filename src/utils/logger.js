const winston = require("winston");
const { parseSizeToBytes } = require("../helpers");
require("winston-daily-rotate-file");
const fs = require("fs");
const path = require("path");

/**
 * Logger class to handle application-wide logging with file rotation and structured configuration.
 *
 * Provides easy-to-use methods for logging at various levels: info, warn, error, and debug.
 */
class Logger {
  #logger; // Private field for the winston logger instance

  /**
   * Constructs a new logger instance with configurable options.
   *
   * @param {Object} options - Logger configuration options.
   * @param {string} [options.logDir] - Directory where log files are stored.
   * @param {string} [options.fileName] - Base name for log files.
   * @param {string} [options.maxSize] - Maximum file size before creating a new file (e.g., "5mb", "10kb").
   * @param {string} [options.level] - Minimum log level to output (e.g., "info", "warn", "error").
   *
   * @throws {Error} Throws an error if essential configuration is missing or invalid.
   */
  constructor(options = {}) {
    const {
      logDir = "",
      fileName = "nexus-log",
      maxSize = "5mb",
      level = "info",
    } = options;

    const resolvedLogDir = path.resolve(logDir);

    // Ensure directory exists
    if (!fs.existsSync(resolvedLogDir)) {
      fs.mkdirSync(resolvedLogDir, { recursive: true });
    }

    const maxSizeBytes = parseSizeToBytes(maxSize);

    const fileTransport = new winston.transports.File({
      dirname: resolvedLogDir,
      filename: `${fileName}.log`, // Removed date from filename
      maxsize: maxSizeBytes,
      tailable: true,
      maxFiles: 10, // Number of files to keep
    });

    const consoleTransport = new winston.transports.Console({
      format: winston.format.combine(
        winston.format.printf(({ level, message }) => {
          const safeMessage = message || "No message provided.";
          return `[${level.toUpperCase()}]: ${safeMessage}`;
        })
      ),
    });

    this.#logger = winston.createLogger({
      level,
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message }) => {
          const safeMessage = message || "No message provided.";
          return `${timestamp} [${level.toUpperCase()}]: ${safeMessage}`;
        })
      ),
      transports: [fileTransport, consoleTransport],
    });
  }

  /**
   * Logs a message at the specified level.
   *
   * @param {string} level - Log level (e.g., "info", "warn", "error", "debug").
   * @param {string} message - Message to log.
   *
   * @example
   * logger.log("info", "Application started successfully.");
   */
  log(level, message) {
    if (!level || typeof message !== "string") {
      this.#logger.warn(
        `Invalid log parameters: level=${level}, message=${message}`
      );
      return;
    }
    this.#logger.log({ level, message });
  }

  /**
   * Logs an informational message.
   *
   * @param {string} message - Message to log.
   *
   * @example
   * logger.info("User logged in.");
   */
  info(message) {
    this.log("info", message);
  }

  /**
   * Logs a warning message.
   *
   * @param {string} message - Message to log.
   *
   * @example
   * logger.warn("Disk space is running low.");
   */
  warn(message) {
    this.log("warn", message);
  }

  /**
   * Logs an error message.
   *
   * @param {string} message - Message to log.
   *
   * @example
   * logger.error("Failed to connect to the database.");
   */
  error(message) {
    this.log("error", message);
  }

  /**
   * Logs a debug message.
   *
   * @param {string} message - Message to log.
   *
   * @example
   * logger.debug("Debugging user authentication flow.");
   */
  debug(message) {
    this.log("debug", message);
  }
}

module.exports = Logger;
