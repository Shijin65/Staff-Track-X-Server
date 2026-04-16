import winston from "winston";
import { parseSizeToBytes } from "../helpers";
import "winston-daily-rotate-file";
import fs from "fs";
import path from "path";

export interface LoggerOptions {
  logDir?: string;
  fileName?: string;
  maxSize?: string;
  level?: string;
}

/**
 * Logger class to handle application-wide logging with file rotation and structured configuration.
 *
 * Provides easy-to-use methods for logging at various levels: info, warn, error, and debug.
 */
class Logger {
  private logger: winston.Logger;

  /**
   * Constructs a new logger instance with configurable options.
   *
   * @param options - Logger configuration options.
   * @throws Throws an error if essential configuration is missing or invalid.
   */
  constructor(options: LoggerOptions = {}) {
    const {
      logDir = "",
      fileName = "CatersHub-log",
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
        winston.format.printf((info) => {
          const { level, message } = info;
          const safeMessage = message || "No message provided.";
          return `[${level.toUpperCase()}]: ${safeMessage}`;
        })
      ),
    });

    this.logger = winston.createLogger({
      level,
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf((info) => {
          const { timestamp, level, message } = info;
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
   * @param level - Log level (e.g., "info", "warn", "error", "debug").
   * @param message - Message to log.
   */
  log(level: string, message: string): void {
    if (!level || typeof message !== "string") {
      this.logger.warn(
        `Invalid log parameters: level=${level}, message=${message}`
      );
      return;
    }
    this.logger.log({ level, message });
  }

  /**
   * Logs an informational message.
   *
   * @param message - Message to log.
   */
  info(message: string): void {
    this.log("info", message);
  }

  /**
   * Logs a warning message.
   *
   * @param message - Message to log.
   */
  warn(message: string): void {
    this.log("warn", message);
  }

  /**
   * Logs an error message.
   *
   * @param message - Message to log.
   */
  error(message: string): void {
    this.log("error", message);
  }

  /**
   * Logs a debug message.
   *
   * @param message - Message to log.
   */
  debug(message: string): void {
    this.log("debug", message);
  }
}

export default Logger;
