// src/run-check.js
import { checkAllLinks } from "./cron/scheduler.js";
import {connectDB} from "./db/index.js"
import dotenv from "dotenv";
dotenv.config();

console.log("Cron job script started...");
connectDB()
  .then(() => {
    checkAllLinks().then(() => {
      console.log("Cron job script finished.");
      process.exit(0); // Exit successfully
    });
  })
  .catch((err) => {
    console.error("Cron job failed to connect to DB", err);
    process.exit(1); // Exit with an error
  });
