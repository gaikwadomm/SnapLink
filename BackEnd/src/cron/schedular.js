// backend/cron/scheduler.js
import cron from "node-cron";
import { Link } from "../models/link.models.js";
import {
  fetchPageText,
  checkForUpdates,
  sendUpdateEmail,
} from "../services/monitoringService.js";

async function checkAllLinks() {
  console.log("[Monitor] Starting daily link check...");
  // Find all links and populate the owner's email
  // New line with the fix
  const links = await Link.find()
    .populate("userId", "email")
    .select("+lastContentText");
  for (const link of links) {
    // IMPORTANT: Access the decrypted URL using the virtual property
    const urlToCheck = link.urlLink?.trim() || link.decryptedUrl;

    if (!urlToCheck) {
      console.log(`[Monitor] Skipping link ${link._id} due to missing URL.`);
      continue;
    }

    console.log(`[Monitor] Checking link: ${link.title} (${urlToCheck})`);
    const newContent = await fetchPageText(urlToCheck);

    if (!newContent) {
      link.status = "error";
      console.log(`[Monitor] Could not fetch content for ${urlToCheck}.`);
    } else if (!link.lastContentText) {
      // console.log(link.lastContentText)
      // First time checking this link, just save the content as a baseline
      link.lastContentText = newContent;
      link.status = "up-to-date";
      console.log(`[Monitor] Stored initial content for ${link.title}.`);
    } else {
      // We have old content, so let's compare for updates
      const result = await checkForUpdates(newContent, link.lastContentText);

      if (result.hasUpdate) {
        console.log(`[Monitor] ✅ Update found for ${link.title}!`);
        await sendUpdateEmail(
          link.userId.email,
          urlToCheck,
          link.title,
          result.changes
        );
        link.status = "updated";
        link.updateSummary = result.changes;
        link.lastContentText = newContent; // Update the baseline
      } else {
        link.status = "up-to-date";
        console.log(`[Monitor] No significant update for ${link.title}.`);
      }
    }

    link.lastChecked = new Date();
    await link.save();
    // Add a small delay to be respectful to the servers we're checking
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log("[Monitor] Daily link check finished.");
}

export function startScheduler() {
  // Schedules the job to run once every day at 2:00 AM UTC.
  cron.schedule(
    "0 2 * * *",
    () => {
      checkAllLinks();
    },
    {
      scheduled: true,
      timezone: "UTC",
    }
  );

  console.log("✅ Cron job for link monitoring has been scheduled.");
  // Optional: Run once on startup for testing
  // checkAllLinks();
}
