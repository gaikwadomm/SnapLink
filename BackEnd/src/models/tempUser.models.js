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

// Hash password before saving
tempUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Auto delete expired temp users after 15 minutes
tempUserSchema.index(
  { emailVerificationOTPExpiry: 1 },
  { expireAfterSeconds: 0 }
);

export const TempUser = mongoose.model("TempUser", tempUserSchema);
