// new file at: BackEnd/api/check-updates.js

import mongoose from 'mongoose';
import axios from 'axios';
import nodemailer from 'nodemailer';
import { GoogleGenAI } from "@google/genai";
import { JSDOM } from 'jsdom';
import crypto from 'crypto';

// --- CONFIGURATION ---
// Vercel provides environment variables from your project settings
const {
  MONGODB_URI,
  GEMINI_API_KEY,
  GMAIL_EMAIL,
  GMAIL_APP_PASSWORD,
  ENCRYPTION_SECRET_KEY,
  CRON_SECRET // A secret you create in Vercel project settings
} = process.env;


// --- DATABASE & MODELS ---
// Schemas are defined here to make the serverless function self-contained.

const linkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Collection", default: null },
  title: { type: String, required: true },
  urlLink: { type: String },
  tags: { type: [String], default: ["Tag"] },
  notes: { type: String, trim: true },
  encryptedUrl: { type: String },
  iv: { type: String },
  status: { type: String, enum: ["pending", "up-to-date", "updated", "error"], default: "pending" },
  lastChecked: { type: Date },
  updateSummary: { type: String, default: "" },
  lastContentText: { type: String, select: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Decryption logic
const algorithm = "aes-256-cbc";
let secretKey = ENCRYPTION_SECRET_KEY;
if (secretKey && secretKey.length < 32) secretKey = secretKey.padEnd(32, "0");
else if (secretKey && secretKey.length > 32) secretKey = secretKey.slice(0, 32);
if (secretKey) secretKey = Buffer.from(secretKey, "utf8");

linkSchema.virtual("decryptedUrl").get(function () {
  if (!this.encryptedUrl || !this.iv || !secretKey) return null;
  try {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(this.iv, "hex"));
    let decrypted = decipher.update(this.encryptedUrl, "hex", "utf8");
    return decrypted + decipher.final("utf8");
  } catch (err) { return null; }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
});


// --- HELPER FUNCTIONS ---

const genAI = new GoogleGenAI(GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: GMAIL_EMAIL, pass: GMAIL_APP_PASSWORD },
});

async function fetchPageText(url) {
  if (!url) return null;
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    const dom = new JSDOM(data);
    return dom.window.document.body.textContent.replace(/\s\s+/g, " ").trim();
  } catch (error) {
    console.error(`[Monitor] Error fetching URL ${url}:`, error.message);
    return null;
  }
}

async function checkForUpdates(newContent, oldContent) {
  const prompt = `You are an intelligent website update detection assistant. Compare the OLD CONTENT with the NEW CONTENT of a webpage. Your goal is to identify if a **significant update** has occurred, like a new software version, a major feature announcement, or a documentation rewrite. **Ignore** minor changes like typo fixes, date updates, or small blog posts. Respond with a JSON object. - If a major update is found, respond with: {"update": true, "changes": "A summary of what changed."} - If no major update is found, respond with: {"update": false, "changes": null} --- OLD CONTENT: ${oldContent.substring(0, 4000)} --- NEW CONTENT: ${newContent.substring(0, 4000)} --- JSON Response:`;
  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    // const response = await result.response;
    const jsonText = response.text().trim().replace(/```json|```/g, "");
    const parsed = JSON.parse(jsonText);
    return { hasUpdate: parsed.update || false, changes: parsed.changes || null };
  } catch (error) {
    console.error("[Monitor] Error checking for updates with Gemini:", error);
    return { hasUpdate: false, changes: null };
  }
}

async function sendUpdateEmail(userEmail, linkUrl, linkTitle, changes) {
  const mailOptions = {
    from: `"SnapLink Updates" <${GMAIL_EMAIL}>`,
    to: userEmail,
    subject: `SnapLink Update: '${linkTitle}' has changed!`,
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;"><h2>Hey there!</h2><p>We noticed a significant update to one of your saved links:</p><p><strong><a href="${linkUrl}" target="_blank">${linkTitle}</a></strong></p><hr><h3>Here's what changed:</h3><p style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;"><em>${changes}</em></p><p>Happy linking!</p><p><em>The SnapLink Team</em></p></div>`,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Monitor] Update email sent to ${userEmail} for link ${linkUrl}`);
  } catch (error) {
    console.error(`[Monitor] Failed to send email to ${userEmail}:`, error);
  }
}

async function processSingleLink(link, LinkModel) {
  const urlToCheck = link.decryptedUrl;
  if (!urlToCheck) {
    console.log(`[Skipping] Link ${link._id} has no URL.`);
    return;
  }

  console.log(`[Checking] Link: ${link.title}`);
  const newContent = await fetchPageText(urlToCheck);

  const updateData = { lastChecked: new Date() };

  if (!newContent) {
    updateData.status = "error";
    console.log(`[Error] Could not fetch content for ${link.title}.`);
  } else if (!link.lastContentText) {
    updateData.status = "up-to-date";
    updateData.lastContentText = newContent;
    console.log(`[Baseline] Stored initial content for ${link.title}.`);
  } else {
    const result = await checkForUpdates(newContent, link.lastContentText);
    if (result.hasUpdate) {
      console.log(`[Update Found] For ${link.title}!`);
      const linkWithOwner = await LinkModel.findById(link._id).populate("userId", "email");
      if (linkWithOwner && linkWithOwner.userId) {
        await sendUpdateEmail(linkWithOwner.userId.email, urlToCheck, link.title, result.changes);
      }
      updateData.status = "updated";
      updateData.updateSummary = result.changes;
      updateData.lastContentText = newContent;
    } else {
      updateData.status = "up-to-date";
      console.log(`[No Update] For ${link.title}.`);
    }
  }
  await LinkModel.findByIdAndUpdate(link._id, { $set: updateData });
}


// --- VERCEL SERVERLESS HANDLER ---
// Vercel will call this function on the schedule defined in vercel.json
export default async function handler(request, response) {
  // Security check to ensure only Vercel's scheduler can run this
  if (request.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return response.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Debug: Check what your current model is pointing to
    console.log("Link model collection name:", Link.collection.name);
    // A serverless function must connect to the DB on each run
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected for cron job.");

    const Link = mongoose.models.Link || mongoose.model("Link", linkSchema);
    const User = mongoose.models.User || mongoose.model("User", userSchema);

    // This is the core logic from your checkAllLinks function
    const linksToCheck = await Link.find().select("+lastContentText");
    console.log(`Found ${linksToCheck.length} links to process in parallel.`);

    const allPromises = linksToCheck.map((link) =>
      processSingleLink(link, Link)
    );
    await Promise.allSettled(allPromises);

    // Disconnect from the DB when done
    await mongoose.connection.close();
    console.log("Cron job finished successfully.");

    // Send a success response
    return response
      .status(200)
      .json({ message: `Processed ${linksToCheck.length} links.` });
  } catch (error) {
    console.error("Error in Vercel Cron Job:", error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    return response.status(500).json({ message: "An error occurred." });
  }
}
