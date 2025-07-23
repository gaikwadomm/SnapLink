// src/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // or your server URL/port

export default socket;
