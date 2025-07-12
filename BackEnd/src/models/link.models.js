import mongoose, { Schema } from "mongoose";
import crypto from "crypto";

// You can move these to .env and load with dotenv
const algorithm = "aes-256-cbc";
const secretKey =
  process.env.ENCRYPTION_SECRET_KEY || crypto.randomBytes(32).toString("hex");
const iv = crypto.randomBytes(16);

const linkSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    encryptedUrl: {
      type: String,
      required: true,
      unique: true,
    },
    iv: {
      type: String,
      required: true,
    },
    tags: {
      type: String,
      default: "Tag",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // enable computed fields like decryptedUrl
  }
);

// 🔐 Encryption before saving
linkSchema.pre("save", function (next) {
  if (
    !this.isModified("encryptedUrl") &&
    !this.isModified("iv") &&
    !this.isModified("urlLink")
  )
    return next();

  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"),
    iv
  );
  let encrypted = cipher.update(this.urlLink, "utf8", "hex");
  encrypted += cipher.final("hex");

  this.encryptedUrl = encrypted;
  this.iv = iv.toString("hex");
  this.urlLink = undefined; // remove raw urlLink from DB

  next();
});

// 🔓 Decryption virtual field
linkSchema.virtual("decryptedUrl").get(function () {
  try {
    const decipher = crypto.createDecipheriv(
      algorithm,
      Buffer.from(secretKey, "hex"),
      Buffer.from(this.iv, "hex")
    );
    let decrypted = decipher.update(this.encryptedUrl, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    return "Decryption failed";
  }
});

export const Link = mongoose.model("Link", linkSchema);
