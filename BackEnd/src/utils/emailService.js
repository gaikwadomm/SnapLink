import nodemailer from "nodemailer";

// Create Gmail SMTP transporter
let transporter = null;

const createTransporter = () => {
  if (!transporter) {
    if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
      throw new Error(
        "GMAIL_EMAIL and GMAIL_APP_PASSWORD environment variables are required"
      );
    }

    console.log("🚀 Initializing Gmail SMTP transporter...");
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD, // App Password, not regular password
      },
    });
    console.log("✅ Gmail SMTP transporter initialized successfully");
  }
  return transporter;
};

// import nodemailer from "nodemailer";

// let transporter = null;

// const createTransporter = () => {
//   if (!transporter) {
//     if (
//       !process.env.SMTP_HOST ||
//       !process.env.SMTP_USER ||
//       !process.env.SMTP_PASS
//     ) {
//       throw new Error("SMTP credentials are missing in environment variables");
//     }

//     console.log("🚀 Initializing Brevo SMTP transporter...");
//     transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: parseInt(process.env.SMTP_PORT) || 587,
//       secure: false, // use true for 465
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     });
//     console.log("✅ Brevo SMTP transporter initialized successfully");
//   }
//   return transporter;
// };


// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
export const sendVerificationEmail = async (email, otp, username) => {
  try {
    console.log("🚀 Sending verification email with Gmail SMTP...");
    console.log("📧 To:", email, "OTP:", otp, "Username:", username);

    const gmailTransporter = createTransporter();

    const mailOptions = {
      from: {
        name: "SnapLink",
        address: process.env.GMAIL_EMAIL,
      },
      to: email,
      subject: "Verify Your SnapLink Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0;">SnapLink</h1>
              <p style="color: #666; margin: 5px 0;">Save the links that matter</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${username}!</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Thank you for signing up with SnapLink! To complete your registration, please verify your email address using the OTP below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #f8f9fa; border: 2px dashed #007bff; padding: 20px; border-radius: 8px; display: inline-block;">
                <h1 style="color: #007bff; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
              </div>
            </div>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 10px;">
              <strong>This OTP will expire in 10 minutes.</strong>
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              If you didn't create an account with SnapLink, please ignore this email.
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an automated email. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const result = await gmailTransporter.sendMail(mailOptions);
    console.log("✅ Verification email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, otp, username) => {
  try {
    console.log("🚀 Sending password reset email with Gmail SMTP...");
    console.log("📧 To:", email, "OTP:", otp, "Username:", username);

    const gmailTransporter = createTransporter();

    const mailOptions = {
      from: {
        name: "SnapLink",
        address: process.env.GMAIL_EMAIL,
      },
      to: email,
      subject: "Reset Your SnapLink Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0;">SnapLink</h1>
              <p style="color: #666; margin: 5px 0;">Save the links that matter</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${username}!</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              You requested to reset your password. Use the OTP below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #f8f9fa; border: 2px dashed #dc3545; padding: 20px; border-radius: 8px; display: inline-block;">
                <h1 style="color: #dc3545; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
              </div>
            </div>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 10px;">
              <strong>This OTP will expire in 10 minutes.</strong>
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              If you didn't request a password reset, please ignore this email.
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an automated email. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const result = await gmailTransporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);
    return { success: false, error: error.message };
  }
};
