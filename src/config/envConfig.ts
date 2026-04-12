import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const NODE_ENV = process.env.NODE_ENV
 export const PORT = process.env.PORT
 export const FRONTEND_URL = process.env.FRONTEND_URL
 export const BACKEND_URL = process.env.BACKEND_URL
 export const FRONTEND_URL_DEV = process.env.FRONTEND_URL_DEV
 export const SERVER_BASE_ROUTE = process.env.SERVER_BASE_ROUTE
 export const ICONS_DIR = process.env.ICONS_DIR
 export const PLAYWRIGHT_EXECUTABLE_PATH = process.env.PLAYWRIGHT_EXECUTABLE_PATH

  //BCRYPT
  export const BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS

  // DB CREDENTIALS
  export const DB_NAME = process.env.DB_NAME
  export const DB_USER = process.env.DB_USER
  export const DB_PASSWORD = process.env.DB_PASSWORD
  export const DB_HOST = process.env.DB_HOST

  // JWT
  export const ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY
  export const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY
  export const JWT_ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_TOKEN_EXPIRY
  export const JWT_REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_TOKEN_EXPIRY

  export const PASSWORD_SETUP_SECRET_KEY = process.env.PASSWORD_SETUP_SECRET_KEY
  export const PASSWORD_SETUP_LINK_EXPIRY = process.env.PASSWORD_SETUP_LINK_EXPIRY
  export const REQUIRE_SECURE_COOKIES = process.env.REQUIRE_SECURE_COOKIES

  // EMAIL
  export const SMTP_HOST = process.env.SMTP_HOST
  export const SMTP_PORT = process.env.SMTP_PORT
  export const SMTP_SECURE = process.env.SMTP_SECURE
  export const SMTP_USER = process.env.SMTP_USER
  export const SMTP_PASS = process.env.SMTP_PASS
  export const SMTP_REJECT_UNAUTHORIZED = process.env.SMTP_REJECT_UNAUTHORIZED

  // LOGGER
  export const MAIN_LOG_DIR = process.env.MAIN_LOG_DIR
  export const EMAIL_LOG_DIR = process.env.EMAIL_LOG_DIR
  export const LOG_FILE_NAME = process.env.LOG_FILE_NAME
  export const LOG_MAX_SIZE = process.env.LOG_MAX_SIZE
  export const LOG_LEVEL = process.env.LOG_LEVEL
