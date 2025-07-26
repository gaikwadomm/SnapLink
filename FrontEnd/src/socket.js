// src/socket.js
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3000", {
  withCredentials: true,
  transports: ["websocket", "polling"],
  timeout: 20000,
  forceNew: true,
});

// Add connection event listeners for debugging
// socket.on("connect", () => {
//   console.log("✅ Socket connected:", socket.id);
// });

// socket.on("disconnect", (reason) => {
//   console.log("❌ Socket disconnected:", reason);
// });

// socket.on("connect_error", (error) => {
//   console.error("🚨 Socket connection error:", error);
// });

export default socket;
