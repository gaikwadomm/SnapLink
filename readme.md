SnapLink: Your AI-Powered Web Monitor
<p align="center">
<img src="./FrontEnd/SnapLinkLogo.png" alt="SnapLink Logo" width="150"/>
</p>

<p align="center">
<strong>An intelligent web monitoring tool that automates the process of tracking websites for significant updates, ensuring you never miss critical information.</strong>
</p>

<p align="center">
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
<img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
<img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel">
<img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render">
</p>

The Problem
We all rely on websites for important information, but checking them for updates is a manual, repetitive chore that often leads to frustration and missed opportunities.

As a developer, this problem is especially frustrating. A few months back, react-router updated to version 7, introducing major breaking changes to its syntax. The issue? Even powerful AI assistants were still providing old, outdated code based on the previous version, leading to major syntax errors that can take hours to debug.

This manual process is inefficient, time-consuming, and you live with the constant fear of missing a crucial update that could break your project or cause you to miss a deadline.

The Solution: SnapLink 🚀
SnapLink solves this problem by completely automating the process.

Save a Link, Once: You simply save the URL of any documentation, product page, or announcement to your SnapLink dashboard.

SnapLink Does the Work: Every day, our system automatically visits the page for you.

Intelligent Analysis: SnapLink uses an advanced algorithm to understand the page's content. It knows the difference between a minor typo fix and a major version announcement.

Get Notified Only When It Matters: When a significant event occurs, SnapLink generates a quick summary of what changed and instantly sends you an email alert. You get the critical information you need, without the noise and without the manual work.

Key Features
Secure User Authentication: JWT-based authentication with short-lived access tokens and a refresh token mechanism.

Link Management: Add, edit, and delete links from a clean, intuitive dashboard.

Link Collections: Organize your saved links into collections for better management.

AES-256 Encryption: All saved URLs are encrypted in the database for enhanced security.

Automated Daily Checks: A serverless cron job runs daily to check all saved links for updates.

Intelligent Change Detection: Leverages the Google Gemini API to identify significant content changes and ignore minor ones.

Email Notifications: Receive instant email alerts with a summary of what changed when an update is detected.

Tech Stack & Architecture
SnapLink is a full-stack MERN application with a modern, decoupled architecture for its automated tasks.

Technologies Used
Frontend: React, Tailwind CSS

Backend API: Node.js, Express.js

Database: MongoDB (with Mongoose)

Intelligent Analysis: Google Gemini API

Email Service: Nodemailer

Architecture
The application is deployed across two cloud platforms to optimize for cost and functionality:

Main Application (Render): The core React frontend and Node.js/Express backend API are hosted as a Web Service on Render. This monolithic structure was chosen for its initial development velocity and simplicity.

Automated Cron Job (Vercel): The daily link-checking script is deployed as a serverless cron job on Vercel's free tier. This decoupled approach ensures the background task runs reliably without keeping the main server active and avoids the "sleeping server" problem common on free hosting plans.

Security Posture
Security is a core consideration in SnapLink, with a defense-in-depth approach across the stack.

Application Layer (Node.js/Express):

HTTP Security Headers: helmet is used to set crucial headers like Strict-Transport-Security and X-Frame-Options to prevent common attacks.

Input Validation: express-validator is used to validate all user-supplied data to prevent NoSQL injection and other attacks.

Rate Limiting: Authentication endpoints are protected from brute-force attacks by limiting request rates.

Dependency Scanning: npm audit is used to scan for and patch known vulnerabilities in third-party dependencies.

Database (MongoDB):

Authentication & RBAC: Anonymous access is disabled, and the application uses a dedicated user with the minimum required permissions.

Network Security: The database is not exposed to the public internet and is firewalled to only allow connections from the application server.

Encryption: Data is encrypted in transit using TLS/SSL.

Authentication (JWT):

Secure Storage: JWTs are stored in HttpOnly cookies to prevent token theft via XSS attacks.

Short-Lived Tokens: Short expiration times (15 min) for access tokens limit the impact of a compromised token, with a refresh token system for longer sessions.

Strong Secrets: High-entropy secret keys are used for signing to prevent brute-force attacks.

Getting Started: Local Setup
To get a local copy up and running, follow these simple steps.

Prerequisites
Node.js (v18 or later)

npm

Git

Installation
Clone the repository:

git clone https://github.com/gaikwadomm/SnapLink.git
cd SnapLink

Install Backend Dependencies:

cd BackEnd
npm install

Install Frontend Dependencies:

cd ../FrontEnd
npm install

Environment Variables
You will need to create a .env file in the BackEnd directory. Copy the contents of .env.sample and fill in your own credentials.

BackEnd/.env

# MongoDB Connection String
MONGODB_URI=your_mongodb_connection_string

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Gmail Credentials for Nodemailer
GMAIL_EMAIL=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# Encryption Key for URLs
ENCRYPTION_SECRET_KEY=a_long_random_32_character_string

# Vercel Cron Job Secret (for local testing)
CRON_SECRET=a_long_random_string_for_security

Running the Application
Start the Backend Server:

cd BackEnd
npm run dev

Start the Frontend Development Server:

cd FrontEnd
npm run dev

The application should now be running on http://localhost:5173.

Future Enhancements
Browser Extension: A one-click extension to save links directly from any webpage.

Headless Browser Integration: Use a tool like Puppeteer to enable monitoring of dynamic, JavaScript-heavy websites.

Customizable Check Frequency: Allow users to set how often their links are checked (hourly, daily, weekly).

Multi-Channel Notifications: Add support for notifications via Slack and Discord.

Architectural Evolution: For long-term scalability, incrementally migrate functionality from the monolith to microservices using the Strangler Fig pattern.