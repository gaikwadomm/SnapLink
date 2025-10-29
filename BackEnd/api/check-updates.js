// new file at: BackEnd/api/check-updates.js

import mongoose from "mongoose";
import axios from "axios";
import nodemailer from "nodemailer";
import { GoogleGenAI } from "@google/genai";
import { JSDOM } from "jsdom";
import crypto from "crypto";

// --- CONFIGURATION ---
// Vercel provides environment variables from your project settings
const {
  MONGODB_URI,
  GMAIL_EMAIL,
  GMAIL_APP_PASSWORD,
  ENCRYPTION_SECRET_KEY,
  CRON_SECRET, // A secret you create in Vercel project settings
} = process.env;

// --- DATABASE & MODELS ---
// Schemas are defined here to make the serverless function self-contained.

const linkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
      default: null,
    },
    title: { type: String, required: true },
    urlLink: { type: String },
    tags: { type: [String], default: ["Tag"] },
    notes: { type: String, trim: true },
    encryptedUrl: { type: String },
    iv: { type: String },
    status: {
      type: String,
      enum: ["pending", "up-to-date", "updated", "error"],
      default: "pending",
    },
    lastChecked: { type: Date },
    updateSummary: { type: String, default: "" },
    lastContentText: { type: String, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Decryption logic
const algorithm = "aes-256-cbc";
let secretKey = ENCRYPTION_SECRET_KEY;
if (secretKey && secretKey.length < 32) secretKey = secretKey.padEnd(32, "0");
else if (secretKey && secretKey.length > 32) secretKey = secretKey.slice(0, 32);
if (secretKey) secretKey = Buffer.from(secretKey, "utf8");

linkSchema.virtual("decryptedUrl").get(function () {
  if (!this.encryptedUrl || !this.iv || !secretKey) return null;
  try {
    const decipher = crypto.createDecipheriv(
      algorithm,
      secretKey,
      Buffer.from(this.iv, "hex")
    );
    let decrypted = decipher.update(this.encryptedUrl, "hex", "utf8");
    return decrypted + decipher.final("utf8");
  } catch (err) {
    return null;
  }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
});

// --- HELPER FUNCTIONS ---

const genAI = new GoogleGenAI(GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   aut GMAIL_EMAIL, pass: GMAIL_APP_PASSWORD },
// });

let transporter = null;

const createTransporter = () => {
  if (!transporter) {
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      throw new Error("SMTP credentials are missing in environment variables");
    }

    console.log("🚀 Initializing Brevo SMTP transporter...");
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // use true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log("✅ Brevo SMTP transporter initialized successfully");
  }
  return transporter;
};

async function fetchPageText(url) {
  if (!url) return null;
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
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

    // Fix the JSON cleaning logic
    let jsonText = result.text.trim();
    console.log("Raw Gemini response:", jsonText);

    // Remove markdown code blocks if present
    if (jsonText.includes("```")) {
      jsonText = jsonText
        .replace(/```json\n?/g, "")
        .replace(/```/g, "")
        .trim();
    }

    console.log("Cleaned JSON:", jsonText);

    const parsed = JSON.parse(jsonText);
    return {
      hasUpdate: parsed.update || false,
      changes: parsed.changes || null,
    };
  } catch (error) {
    console.error("[Monitor] Error checking for updates with Gemini:", error);
    return { hasUpdate: false, changes: null };
  }
}

// async function sendUpdateEmail(userEmail, linkUrl, linkTitle, changes) {
//   const mailOptions = {
//     from: ` GMAIL_EMAIL}>`,
//     to: userEmail,
//     subject: `SnapLink Update: '${linkTitle}' has changed!`,
//     html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;"><h2>Hey there!</h2><p>We noticed a significant update to one of your saved links:</p><p><strong><a href="${linkUrl}" target="_blank">${linkTitle}</a></strong></p><hr><h3>Here's what changed:</h3><p style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;"><em>${changes}</em></p><p>Happy linking!</p><p><em>The SnapLink Team</em></p></div>`,
//   };
//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`[Monitor] Update email sent to ${userEmail} for link ${linkUrl}`);
//   } catch (error) {
//     console.error(`[Monitor] Failed to send email to ${userEmail}:`, error);
//   }
// }

const sendUpdateEmail = async (userEmail, linkUrl, linkTitle, changes) => {
  try {
    console.log("🚀 Sending update email with Brevo SMTP...");
    console.log("📧 To:", userEmail, "Link:", linkUrl, "Title:", linkTitle);
    const gmailTransporter = createTransporter();
    const mailOptions = {
      from: {
        name: "SnapLink Updates",
        address: GMAIL_EMAIL,
      },
      to: userEmail,
      subject: `SnapLink Update: '${linkTitle}' has changed!`,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;"><h2>Hey there!</h2><p>We noticed a significant update to one of your saved links:</p><p><strong><a href="${linkUrl}" target="_blank">${linkTitle}</a></strong></p><hr><h3>Here's what changed:</h3><p style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;"><em>${changes}</em></p><p>Happy linking!</p><p><em>The SnapLink Team</em></p></div>`,
    };
    const result = await gmailTransporter.sendMail(mailOptions);
    console.log("✅ Update email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Error sending update email:", error);
    return { success: false, error: error.message };
  }
};

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
      const linkWithOwner = await LinkModel.findById(link._id).populate(
        "userId",
        "email"
      );
      if (linkWithOwner && linkWithOwner.userId) {
        await sendUpdateEmail(
          linkWithOwner.userId.email,
          urlToCheck,
          link.title,
          result.changes
        );
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
export default async function handler(request, response) {
  if (request.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return response.status(401).json({ message: "Unauthorized" });
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected for cron job.");

    // ===================================================================
    //  DEBUGGING LOGS
    // ===================================================================
    const dbName = mongoose.connection.db.databaseName;
    console.log(`Connected to database: "${dbName}"`);

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const collectionNames = collections.map((c) => c.name);
    console.log("Available collections:", collectionNames);
    // ===================================================================

    const Link = mongoose.models.Link || mongoose.model("Link", linkSchema);
    const User = mongoose.models.User || mongoose.model("User", userSchema);

    const linksToCheck = await Link.find().select("+lastContentText");
    console.log(`Found ${linksToCheck.length} links to process in parallel.`);

    if (linksToCheck.length > 0) {
      const allPromises = linksToCheck.map((link) =>
        processSingleLink(link, Link)
      );
      await Promise.allSettled(allPromises);
    }

    await mongoose.connection.close();
    console.log("Cron job finished successfully.");

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
