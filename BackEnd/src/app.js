import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http";
import { errorHandler } from "./middlewares/error.middlewares.js";
const app = express();

// Create HTTP server
const server = http.createServer(app);
// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (Socket)=>{
  console.log("A user connected:", Socket.id);
  // Add your event handlers here
})

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
import userRouters from "./routes/user.routes.js";
import linkRouters from "./routes/links.routes.js";
import { Socket } from "dgram";
// Using routes
app.use("/api/healthcheck", healthCheckRoutes);
app.use("/api/v1/users", userRouters);
app.use("/api/v1/links", linkRouters);

// Error handling middleware
app.use(errorHandler)
export { app, server, io };
