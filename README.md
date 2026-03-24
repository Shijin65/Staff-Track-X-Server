# BaseApp - Backend Server

BaseApp Server is a robust, modular Express.js backend designed for scalability and security. Structured around domain-driven design, it comes fully equipped with Role-Based Access Control (RBAC), robust authentication, logging, caching, and an advanced permission syncing strategy.

## 🚀 Key Features

- **Authentication & Authorization**: Secure JWT-based authentication (Access & Refresh tokens).
- **Advanced RBAC**: Dynamic role-based access control with permissions automatically synced to the database on startup and loaded into an in-memory Redis/native cache for high performance.
- **Domain-Driven Architecture**: Separation of concerns logic grouped by domain (`user`, `user-role`, `auth`, etc.).
- **Security-First**: Integrated helmet, CORS, and HTTP-only strict cookies.
- **Robust Validation**: Request body and parameter validation using `yup` combined with custom validation middleware.
- **Logging Management**: Structured logging powered by `winston` and `winston-daily-rotate-file`, keeping logs organized and maintained without bloating storage.
- **Database & ORM**: PostgreSQL paired with Sequelize ORM for models and migrations.
- **API Documentation**: Pre-setup with Swagger for clear API consumption definitions.
- **TypeScript Support**: Core modules and services are migrating to and well-typed with TypeScript for reliable code safety.

## 💻 Technology Stack

- **Runtime Environment**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: TypeScript / JavaScript
- **Database**: PostgreSQL with Sequelize ORM
- **Cache**: Redis
- **Authentication**: JWT (JSON Web Tokens) & `bcrypt` for hashing
- **Validation**: Yup
- **Logging**: Winston
- **Email Delivery**: Nodemailer

## 📂 Project Structure

```text
src/
├── cache/                  # Redis caching operations and helpers
├── config/                 # Environment setups (DB, Logger, Email, env vars)
├── constants/              # Application-wide constants & predefined permissions
├── domain/                 # Domain-driven modules (Business logic, controllers, seeds)
│   ├── general/            # Login, verification logic
│   ├── user/               # User administration
│   └── user-role/          # RBAC roles management
├── middleware/             # Express middlewares (Auth, Validation, AccessControl)
├── models/                 # Sequelize database models
├── routes/                 # Consolidated API routes
├── services/               # Reusable business logic/cache syncing (e.g., syncPermissionsWithDB)
└── server.ts               # Main Application Bootstrap entry
```

## ⚙️ Environment Variables

Create a `.env` file at the root of the project with the following configuration constraints:

```env
# SERVER INFO
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
SERVER_BASE_ROUTE="/"

# DB CREDENTIALS
DB_NAME=base_app_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost

# JWT SECRETS & EXPIRATIONS
ACCESS_SECRET_KEY=your_access_secret
REFRESH_SECRET_KEY=your_refresh_secret
PASSWORD_SETUP_SECRET_KEY=your_password_secret
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=30d

# REDIS CONFIGURATION
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_KEY_PREFIX=BA

# EMAIL SMTP CONFIG
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# LOGGER
MAIN_LOG_DIR=path_to_log_dir
EMAIL_LOG_DIR=path_to_email_log_dir
```

## 🛠️ Installation & Setup

1. **Install dependencies:**
   Make sure you are in the `Base-Server` directory, then run:
   ```bash
   npm install
   ```

2. **Database Setup:**
   Ensure PostgreSQL is running locally or remotely. Create the database specified in your `.env` under `DB_NAME`.

3. **Redis Setup:**
   Ensure your Redis server is active and accessible via the port/host defined in `.env`.

4. **Running the Server:**
   In development mode (using nodemon/ts-node):
   ```bash
   npm run dev
   ```
   
   Alternatively, you can start the raw node file:
   ```bash
   npm start
   ```

Upon a successful launch, application permissions are synced to the database seamlessly and loaded into the cache hierarchy, and Swagger documentation should be accessible (if enabled in your route definitions).
