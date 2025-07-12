import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

//common middlewears
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Importing routes
import healthCheckRoutes from "./routes/healthcheck.routes.js";
import userRouters from "./routes/user.routes.js"
// Using routes
app.use("/api/healthcheck", healthCheckRoutes);
app.use("/api/v1/users", userRouters)

export { app };
