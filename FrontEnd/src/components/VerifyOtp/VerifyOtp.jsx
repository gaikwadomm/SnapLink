import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

const VerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Get email from location state (passed from registration)
  const email = location.state?.email;

  useEffect(() => {
    // Redirect if no email provided
    if (!email) {
      toast.error("Please register first");
      navigate("/signup");
      return;
    }

    // Start countdown timer
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  // Focus first input on component mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const pastedOtp = text.replace(/\D/g, "").slice(0, 6).split("");
        const newOtp = [...otp];
        pastedOtp.forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit;
        });
        setOtp(newOtp);

        // Focus last filled input or next empty input
        const lastIndex = Math.min(pastedOtp.length - 1, 5);
        inputRefs.current[lastIndex]?.focus();
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter complete 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(
        `/v1/users/verify-email`,
        {
          email,
          otp: otpString,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        
        toast.success("Email verified successfully! You are now logged in.");

        // Store user data in localStorage if needed
        if (response.data.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.data.user));
        }

        // Redirect to dashboard or home
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("OTP verification error:", error);

      if (error.response?.status === 400) {
        const message = error.response.data.message;
        if (message.includes("expired")) {
          toast.error("OTP has expired. Please request a new one.");
          setOtp(["", "", "", "", "", ""]);
        } else if (message.includes("Invalid")) {
          toast.error("Invalid OTP. Please try again.");
          setOtp(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        } else {
          toast.error(message);
        }
      } else if (error.response?.status === 404) {
        toast.error("Registration not found. Please register again.");
        navigate("/signup");
      } else {
        toast.error("Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    try {
      const response = await axiosInstance.post(
        `/v1/users/resend-verification`,
        { email },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("New OTP sent to your email");
        setCountdown(60);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();

        // Start new countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error("Resend OTP error:", error);

      if (error.response?.status === 404) {
        toast.error("Registration not found. Please register again.");
        navigate("/signup");
      } else {
        toast.error(error.response?.data?.message || "Failed to resend OTP");
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit code to
          </p>
          <p className="text-sm font-medium text-blue-600">{email}</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 text-center mb-4">
                Enter 6-digit verification code
              </label>

              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || otp.some((digit) => !digit)}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verifying...
                  </div>
                ) : (
                  "Verify Email"
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{" "}
                {countdown > 0 ? (
                  <span className="text-gray-500">Resend in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendLoading}
                    className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition-colors disabled:opacity-50"
                  >
                    {resendLoading ? "Sending..." : "Resend OTP"}
                  </button>
                )}
              </p>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:underline"
              >
                ← Back to registration
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center">
        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 Tips: You can paste the OTP directly</p>
          <p>📧 Check your spam folder if you don't see the email</p>
          <p>⏰ OTP expires in 10 minutes</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
