import { app, server } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { startScheduler } from "./cron/schedular.js";

// This code uses the dotenv package to load environment variables from a file named .env located in the project root.

// Explanation:

// dotenv.config({ path: "./.env" }) tells dotenv to read key-value pairs from .env and add them to process.env.
// This allows you to keep sensitive information (like API keys, database URLs, etc.) out of your source code and manage them separately.
dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      // Start the cron scheduler for link monitoring
      // startScheduler(); RENDER CRON WILL HANDLE IT DONT ADD
    });
  })
  .catch((err) => {
    console.log(`MongoDB connection error : ${err}`);
  });
