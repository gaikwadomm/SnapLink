import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { TempUser } from "../models/tempUser.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import {
  generateOTP,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/emailService.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    // Saving the refreshToken to the user document.
    // Since only refreshToken is being updated, you can use validateBeforeSave: false for performance,
    // unless you want to ensure all validations run. It's generally safe here.
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
};

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(404, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      domain: process.env.NODE_ENV === "production" ? undefined : "localhost",
    };

    const { accessToken, refreshToken: newRefereshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefereshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefereshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      "Something went wrong while refreshing access token"
    );
  }
});

const loginUser = asyncHandler(async (req, res) => {
  console.log("Login request received");
  const { email, password } = req.body;
  // console.log("Login details:", { email, password });
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({
    $or: [{ email }],
  });

  // console.log("User found:", user ? user.username : "No user found");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    throw new ApiError(401, "Please verify your email before logging in");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Credintials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!loggedInUser) {
    throw new ApiError(500, "Something went wrong while logging in");
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain: process.env.NODE_ENV === "production" ? undefined : "localhost",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully..."
      )
    );
});

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if ([username, email, password].some((field) => field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists in main User collection
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  try {
    // Generate OTP for email verification
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Clean up any existing temp user with same email/username
    await TempUser.deleteMany({
      $or: [{ username }, { email }],
    });

    // Create temporary user (will be moved to User collection after verification)
    const tempUser = await TempUser.create({
      username,
      email,
      password, // Will be hashed by pre-save middleware
      emailVerificationOTP: otp,
      emailVerificationOTPExpiry: otpExpiry,
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(email, otp, username);

    if (!emailResult.success) {
      // If email fails, delete the temp user
      await TempUser.findByIdAndDelete(tempUser._id);
      throw new ApiError(500, "Failed to send verification email");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { email: tempUser.email, username: tempUser.username },
          "Registration initiated. Please check your email for verification code."
        )
      );
  } catch (err) {
    console.log("User registration failed:", err);
    throw new ApiError(500, "Something went wrong while registering user");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  // console.log("logout begins")
  await User.findByIdAndUpdate(
    //TODO : need to come back here after middleware
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain: process.env.NODE_ENV === "production" ? undefined : "localhost",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully..."));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);
    console.log("The user is ", user.username);

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordValid) {
      throw new ApiError(401, "Old password is incorrect");
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password changed Successfully..."));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went wrong while changing password"
    );
  }
});

const deleteAccount = asyncHandler(async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Account deleted successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went wrong while deleting account"
    );
  }
});

// Email verification function
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  // Find the temporary user
  const tempUser = await TempUser.findOne({ email });

  if (!tempUser) {
    throw new ApiError(404, "No pending registration found for this email");
  }

  if (tempUser.emailVerificationOTP !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (tempUser.emailVerificationOTPExpiry < new Date()) {
    // Clean up expired temp user
    await TempUser.findByIdAndDelete(tempUser._id);
    throw new ApiError(400, "OTP has expired. Please register again.");
  }

  try {
    // Check if user already exists in main collection (race condition check)
    const existingUser = await User.findOne({
      $or: [{ username: tempUser.username }, { email: tempUser.email }],
    });

    if (existingUser) {
      // Clean up temp user and throw error
      await TempUser.findByIdAndDelete(tempUser._id);
      throw new ApiError(409, "User already exists. Please login instead.");
    }

    // Create verified user in main User collection
    const verifiedUser = await User.create({
      username: tempUser.username,
      email: tempUser.email,
      password: tempUser.password, 
      isEmailVerified: true,
    });

    // Remove from temporary collection
    await TempUser.findByIdAndDelete(tempUser._id);

    // Generate tokens for immediate login
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      verifiedUser._id
    );

    const loggedInUser = await User.findById(verifiedUser._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      domain: process.env.NODE_ENV === "production" ? undefined : "localhost",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "Email verified successfully. You are now logged in!"
        )
      );
  } catch (error) {
    // Clean up temp user on any error
    await TempUser.findByIdAndDelete(tempUser._id);
    throw new ApiError(500, error.message || "Failed to verify email");
  }
});

// Resend verification email
const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // Check if user already exists in main collection
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(
      400,
      "User already exists and is verified. Please login."
    );
  }

  // Find the temporary user
  const tempUser = await TempUser.findOne({ email });

  if (!tempUser) {
    throw new ApiError(
      404,
      "No pending registration found. Please register first."
    );
  }

  // Generate new OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Update temp user with new OTP
  tempUser.emailVerificationOTP = otp;
  tempUser.emailVerificationOTPExpiry = otpExpiry;
  await tempUser.save();

  // Send verification email
  const emailResult = await sendVerificationEmail(
    email,
    otp,
    tempUser.username
  );

  if (!emailResult.success) {
    throw new ApiError(500, "Failed to send verification email");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Verification email sent successfully"));
});

// Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Generate OTP for password reset
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.passwordResetOTP = otp;
  user.passwordResetOTPExpiry = otpExpiry;
  await user.save({ validateBeforeSave: false });

  // Send password reset email
  const emailResult = await sendPasswordResetEmail(email, otp, user.username);

  if (!emailResult.success) {
    throw new ApiError(500, "Failed to send password reset email");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset email sent successfully"));
});

// Reset password with OTP
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new ApiError(400, "Email, OTP, and new password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.passwordResetOTP !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (user.passwordResetOTPExpiry < new Date()) {
    throw new ApiError(400, "OTP has expired");
  }

  // Reset password
  user.password = newPassword;
  user.passwordResetOTP = undefined;
  user.passwordResetOTPExpiry = undefined;
  user.refreshToken = undefined; // Clear all sessions
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

export {
  loginUser,
  registerUser,
  logoutUser,
  changeCurrentPassword,
  refreshAccessToken,
  deleteAccount,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
};
