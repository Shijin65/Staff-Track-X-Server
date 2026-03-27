import path from "path";
import http from "http";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import { FRONTEND_URL, BACKEND_URL, FRONTEND_URL_DEV } from "./config/envConfig";
import apiHelmet from "./middleware/apiHelmetMiddleware";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
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

server.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});