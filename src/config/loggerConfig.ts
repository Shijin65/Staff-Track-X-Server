import Logger from "../utils/logger";
import {
  MAIN_LOG_DIR,
  EMAIL_LOG_DIR,
  LOG_FILE_NAME,
  LOG_MAX_SIZE,
  LOG_LEVEL,
} from "./envConfig";

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
 * ```typescript
 * import { logger } from "./config/loggerConfig";
 * logger.info("This is an info message.");
 * logger.error("This is an error message.");
 * ```
 */
export const logger = new Logger({
  logDir: MAIN_LOG_DIR as string | undefined,
  fileName: LOG_FILE_NAME as string | undefined,
  maxSize: LOG_MAX_SIZE as string | undefined,
  level: LOG_LEVEL as string | undefined,
});

/**
 * Email logger instance.
 *
 * Logs messages related to email operations.
 *
 * Example:
 * ```typescript
 * import { emailLogger } from "./config/loggerConfig";
 * emailLogger.info("This is an email info message.");
 * emailLogger.error("This is an email error message.");
 * ```
 */
export const emailLogger = new Logger({
  logDir: EMAIL_LOG_DIR as string | undefined,
  fileName: LOG_FILE_NAME as string | undefined,
  maxSize: LOG_MAX_SIZE as string | undefined,
  level: LOG_LEVEL as string | undefined,
});
