import mongoose, { Schema } from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// Define algorithm & key outside so they are accessible everywhere
const algorithm = "aes-256-cbc";
let secretKey = process.env.ENCRYPTION_SECRET_KEY;

// Check/correct key length (32 bytes for AES-256)
if (!secretKey) {
  throw new Error("ENCRYPTION_SECRET_KEY not set in environment variables");
}
if (secretKey.length < 32) {
  secretKey = secretKey.padEnd(32, "0");
} else if (secretKey.length > 32) {
  secretKey = secretKey.slice(0, 32);
}
secretKey = Buffer.from(secretKey, "utf8");

const docsLinkSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    urlLink: {
      type: String,
    },
    tags: {
      type: [String],
      default: ["Tag"],
      validate: {
        validator: function (value) {
          return value.length <= 5;
        },
        message: "You can add up to 5 tags only.",
      },
    },
    notes: { type: String, trim: true },
    encryptedUrl: { type: String },
    iv: { type: String },

    // --- 👇 ADD THESE NEW FIELDS FOR MONITORING ---
    status: {
      type: String,
      enum: ["pending", "up-to-date", "updated", "error"],
      default: "pending",
    },
    lastChecked: {
      type: Date,
    },
    updateSummary: {
      type: String,
      default: "",
    },
    lastContentText: {
      type: String,
      select: false, // Hides this large field from default API responses
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save hook to encrypt urlLink if modified
linkSchema.pre("save", function (next) {
  if (!this.isModified("urlLink")) return next();

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(this.urlLink, "utf8", "hex");
  encrypted += cipher.final("hex");

  this.encryptedUrl = encrypted;
  this.iv = iv.toString("hex");
  this.urlLink = undefined;
  next();
});

// Virtual for decrypted URL (getter)
linkSchema.virtual("decryptedUrl").get(function () {
  if (!this.encryptedUrl || !this.iv) return null;
  try {
    const decipher = crypto.createDecipheriv(
      algorithm,
      secretKey,
      Buffer.from(this.iv, "hex")
    );
    let decrypted = decipher.update(this.encryptedUrl, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    return null;
  }
});

export const DocsLink = mongoose.model("DocsLink", docsLinkSchema);