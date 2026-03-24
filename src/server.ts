import path from "path";
import http from "http";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import { FRONTEND_URL, BACKEND_URL, FRONTEND_URL_DEV } from "./config/envConfig";
import syncPermissionsWithDB from "./services/syncPermissionsWithDB.service";
import cachePermissions from "./services/cachePermission.service";
import apiHelmet from "./middleware/apiHelmetMiddleware";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
// import userRoleRoutes from "./routes/userRoleRoutes";
import { logger } from "./config/loggerConfig";

const app = express();
const server = http.createServer(app);

const port: number | string = process.env.PORT || 8000;

const allowedOrigins = [FRONTEND_URL, BACKEND_URL, FRONTEND_URL_DEV].filter(Boolean);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 200,
};

(async () => {
  try {
    await syncPermissionsWithDB();
    await cachePermissions.loadPermissions();
  } catch (error: any) {
    logger.error(`Failed to sync permissions: ${error.message}`);
  }
})();

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(apiHelmet);
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("App is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// app.use("/api/user-roles", userRoleRoutes);

server.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});