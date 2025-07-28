import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import axiosInstance from "../../utils/axiosInstance.js";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const onForgotPassword = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/v1/users/forgot-password", {
        email,
      });
      toast.success("Password reset OTP sent to your email!");
      console.log("Forgot password response:", response.data);

      // Navigate to reset password page with email
      navigate("/reset-password", {
        state: {
          email: email,
        },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while sending reset OTP."
      );
      console.error("Forgot password error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setButtonDisabled(!email.trim());
  }, [email]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-neutral-900 to-black text-white px-4">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-semibold text-white tracking-wide">
          Snaplink
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Save the links that matter — like your own personal bookmark vault.
        </p>
      </header>

      <div className="w-full max-w-md bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          {loading ? "Sending OTP..." : "Forgot Password"}
        </h2>
        <p className="text-sm text-gray-400 text-center mb-6">
          Enter your email address and we'll send you an OTP to reset your
          password.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onForgotPassword();
          }}
        >
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-neutral-900 text-white placeholder-gray-500 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Enter your email address"
            />
          </div>

          <button
            type="submit"
            disabled={buttonDisabled || loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold hover:from-yellow-500 hover:to-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending OTP..." : "Send Reset OTP"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-amber-400 hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
