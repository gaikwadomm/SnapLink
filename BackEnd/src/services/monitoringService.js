// backend/services/monitoringService.js
import axios from "axios";
import nodemailer from "nodemailer";
import { GoogleGenAI } from "@google/genai";
import { JSDOM } from "jsdom";
import dotenv from "dotenv";
dotenv.config();

// --- CONFIGURATION ---
const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// --- CORE FUNCTIONS ---

/**
 * Fetches the raw HTML from a URL and extracts the main text content.
 * @param {string} url The URL to fetch.
 * @returns {Promise<string|null>} The cleaned text content of the page.
 */
export async function fetchPageText(url) {
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

/**
 * Uses Gemini to check for major updates by comparing old and new content.
 * @param {string} newContent The new text content of the webpage.
 *_@param {string} oldContent The stored text content from the last check.
 * @returns {Promise<{hasUpdate: boolean, changes: string}>}
 */
export async function checkForUpdates(newContent, oldContent) {
  const prompt = `You are an intelligent website update detection assistant.
    Compare the OLD CONTENT with the NEW CONTENT of a webpage.
    Your goal is to identify if a **significant update** has occurred, like a new software version, a major feature announcement, or a documentation rewrite.
    **Ignore** minor changes like typo fixes, date updates, or small blog posts.

    Respond with a JSON object.
    - If a major update is found, respond with: {"update": true, "changes": "A summary of what changed."}
    - If no major update is found, respond with: {"update": false, "changes": null}

    ---
    OLD CONTENT:
    ${oldContent.substring(0, 4000)}
    ---
    NEW CONTENT:
    ${newContent.substring(0, 4000)}
    ---

    JSON Response:`;

  try {
const result = await genai.models.generateContent({
  model: "gemini-2.5-pro",
  contents: prompt
});    
    const response = result.text;
    const jsonText = response
      .trim()
      .replace(/```json|```/g, "");
    const parsed = JSON.parse(jsonText);
    console.log("[Monitor] Gemini response:", parsed);
    return {
      hasUpdate: parsed.update || false,
      changes: parsed.changes || null,
    };
  } catch (error) {
    console.error("[Monitor] Error checking for updates with Gemini:", error);
    return { hasUpdate: false, changes: null };
  }
}

/**
 * Sends an email notification to the user about an update.
_@param {string} userEmail The recipient's email address.
 * @param {string} linkUrl The URL of the link that was updated.
 * @param {string} linkTitle The title of the link.
_@param {string} changes A description of the changes.
 */
export async function sendUpdateEmail(userEmail, linkUrl, linkTitle, changes) {
  const mailOptions = {
    from: `"SnapLink Updates" <${process.env.GMAIL_EMAIL}>`,
    to: userEmail,
    subject: `SnapLink Update: '${linkTitle}' has changed!`,
    html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Hey there!</h2>
                <p>We noticed a significant update to one of your saved links:</p>
                <p><strong><a href="${linkUrl}" target="_blank">${linkTitle}</a></strong></p>
                <hr>
                <h3>Here's what changed:</h3>
                <p style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">
                    <em>${changes}</em>
                </p>
                <p>Happy linking!</p>
                <p><em>The SnapLink Team</em></p>
            </div>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `[Monitor] Update email sent to ${userEmail} for link ${linkUrl}`
    );
  } catch (error) {
    console.error(`[Monitor] Failed to send email to ${userEmail}:`, error);
  }
}
