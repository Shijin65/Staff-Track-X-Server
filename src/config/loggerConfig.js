const Logger = require("../utils/logger");
const {
  MAIN_LOG_DIR,
  EMAIL_LOG_DIR,
  LOG_FILE_NAME,
  LOG_MAX_SIZE,
  LOG_LEVEL,
} = require("./envConfig");

/**
 * Application-wide main logger instance.
 *
 * Provides methods for logging messages at different levels:
 * - `info(message)`: Logs an informational message.
 * - `warn(message)`: Logs a warning message.
 * - `error(message)`: Logs an error message.
 * - `debug(message)`: Logs a debug message.
 *
 * Example:
 * ```javascript
 * const { logger } = require("./config");
 * logger.info("This is an info message.");
 * logger.error("This is an error message.");
 * ```
 */
const logger = new Logger({
  logDir: MAIN_LOG_DIR,
  fileName: LOG_FILE_NAME,
  maxSize: LOG_MAX_SIZE,
  level: LOG_LEVEL,
});

/**
 * Email logger instance.
 *
 * Logs messages related to email operations.
 *
 * Example:
 * ```javascript
 * const { emailLogger } = require("./config");
 * emailLogger.info("This is an email info message.");
 * emailLogger.error("This is an email error message.");
 * ```
 */
const emailLogger = new Logger({
  logDir: EMAIL_LOG_DIR,
  fileName: LOG_FILE_NAME,
  maxSize: LOG_MAX_SIZE,
  level: LOG_LEVEL,
});

module.exports = { logger, emailLogger };
