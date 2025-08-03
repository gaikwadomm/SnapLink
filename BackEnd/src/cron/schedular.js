//Handling by vercel and api/cron/check-update so not needed for now

// // backend/cron/scheduler.js
// import cron from "node-cron";
// import { Link } from "../models/link.models.js";
// import {
//   fetchPageText,
//   checkForUpdates,
//   sendUpdateEmail,
// } from "../services/monitoringService.js";

// async function checkAllLinks() {
//   console.log("[Monitor] Starting daily link check...");
//   // Find all links and populate the owner's email
//   // New line with the fix
//   const links = await Link.find()
//     .populate("userId", "email")
//     .select("+lastContentText");
//   for (const link of links) {
//     // IMPORTANT: Access the decrypted URL using the virtual property
//     const urlToCheck = link.urlLink?.trim() || link.decryptedUrl;

//     if (!urlToCheck) {
//       console.log(`[Monitor] Skipping link ${link._id} due to missing URL.`);
//       continue;
//     }

//     console.log(`[Monitor] Checking link: ${link.title} (${urlToCheck})`);
//     const newContent = await fetchPageText(urlToCheck);

//     if (!newContent) {
//       link.status = "error";
//       console.log(`[Monitor] Could not fetch content for ${urlToCheck}.`);
//     } else if (!link.lastContentText) {
//       // console.log(link.lastContentText)
//       // First time checking this link, just save the content as a baseline
//       link.lastContentText = newContent;
//       link.status = "up-to-date";
//       console.log(`[Monitor] Stored initial content for ${link.title}.`);
//     } else {
//       // We have old content, so let's compare for updates
//       const result = await checkForUpdates(newContent, link.lastContentText);

//       if (result.hasUpdate) {
//         console.log(`[Monitor] ✅ Update found for ${link.title}!`);
//         await sendUpdateEmail(
//           link.userId.email,
//           urlToCheck,
//           link.title,
//           result.changes
//         );
//         link.status = "updated";
//         link.updateSummary = result.changes;
//         link.lastContentText = newContent; // Update the baseline
//       } else {
//         link.status = "up-to-date";
//         console.log(`[Monitor] No significant update for ${link.title}.`);
//       }
//     }

//     link.lastChecked = new Date();
//     await link.save();
//     // Add a small delay to be respectful to the servers we're checking
//     await new Promise((resolve) => setTimeout(resolve, 2000));
//   }

//   console.log("[Monitor] Daily link check finished.");
// }

// export function startScheduler() {
//   // Schedules the job to run once every day at 2:00 AM UTC.
//   cron.schedule(
//     "0 2 * * *",
//     () => {
//       checkAllLinks();
//     },
//     {
//       scheduled: true,
//       timezone: "UTC",
//     }
//   );

//   console.log("✅ Cron job for link monitoring has been scheduled.");
//   // Optional: Run once on startup for testing
//   checkAllLinks();
// }

// export { checkAllLinks };

// backend/cron/scheduler.js
// import cron from "node-cron";
// import { Link } from "../models/link.models.js";
// import {
//   fetchPageText,
//   checkForUpdates,
//   sendUpdateEmail,
// } from "../services/monitoringService.js";

// /**
//  * Processes a single link to check for updates.
//  * This function is designed to be run in parallel for all links.
//  * @param {object} link - The Mongoose document for the link to process.
//  */
// async function processSingleLink(link) {
//   const urlToCheck = link.urlLink || link.decryptedUrl;

//   if (!urlToCheck) {
//     console.log(`[Skipping] Link ${link._id} has no URL.`);
//     return; // Nothing to do
//   }

//   console.log(`[Checking] Link: ${link.title}`);
//   const newContent = await fetchPageText(urlToCheck);

//   // Prepare the data for the database update
//   const updateData = {
//     lastChecked: new Date(),
//   };

//   if (!newContent) {
//     updateData.status = "error";
//     console.log(`[Error] Could not fetch content for ${link.title}.`);
//   } else if (!link.lastContentText) {
//     updateData.status = "up-to-date";
//     updateData.lastContentText = newContent;
//     console.log(`[Baseline] Stored initial content for ${link.title}.`);
//   } else {
//     const result = await checkForUpdates(newContent, link.lastContentText);

//     if (result.hasUpdate) {
//       console.log(`[Update Found] For ${link.title}!`);
//       // We need to populate the user's email to send the notification
//       const linkWithOwner = await Link.findById(link._id).populate(
//         "userId",
//         "email"
//       );

//       if (linkWithOwner && linkWithOwner.userId) {
//         await sendUpdateEmail(
//           linkWithOwner.userId.email,
//           urlToCheck,
//           link.title,
//           result.changes
//         );
//       }

//       updateData.status = "updated";
//       updateData.updateSummary = result.changes;
//       updateData.lastContentText = newContent; // Update the baseline
//     } else {
//       updateData.status = "up-to-date";
//       console.log(`[No Update] For ${link.title}.`);
//     }
//   }

//   // Atomically find and update the link in the database
//   await Link.findByIdAndUpdate(link._id, { $set: updateData });
// }

// /**
//  * Fetches all links and processes them in parallel.
//  */
// async function checkAllLinks() {
//   console.log("[Monitor] Starting daily link check...");

//   const linksToCheck = await Link.find().select("+lastContentText");
//   console.log(`Found ${linksToCheck.length} links to process in parallel.`);

//   // Create an array of promises, one for each link to be processed
//   const allPromises = linksToCheck.map((link) => processSingleLink(link));

//   // Use Promise.allSettled to run all checks concurrently
//   const results = await Promise.allSettled(allPromises);

//   results.forEach((result, index) => {
//     if (result.status === "rejected") {
//       console.error(
//         `Error processing link with title "${linksToCheck[index].title}":`,
//         result.reason
//       );
//     }
//   });

//   console.log("[Monitor] Daily link check finished.");
// }

// export function startScheduler() {
//   // Schedules the job to run once every day at 2:00 AM UTC.
//   cron.schedule(
//     "0 2 * * *",
//     () => {
//       checkAllLinks();
//     },
//     {
//       scheduled: true,
//       timezone: "UTC",
//     }
//   );

//   console.log("✅ Cron job for link monitoring has been scheduled.");
//   // Optional: Run once on startup for testing
//   // checkAllLinks();
// }

// // Exported for potential use in a serverless/manual trigger environment
// export { checkAllLinks };
