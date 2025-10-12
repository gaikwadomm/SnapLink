import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const tempUserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    emailVerificationOTP: {
      type: String,
      required: true,
    },
    emailVerificationOTPExpiry: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto delete expired temp users after 15 minutes
tempUserSchema.index(
  { emailVerificationOTPExpiry: 1 },
  { expireAfterSeconds: 0 }
);

export const TempUser = mongoose.model("TempUser", tempUserSchema);
