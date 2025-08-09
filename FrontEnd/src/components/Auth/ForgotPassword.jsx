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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white px-4">
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-white tracking-wider mb-2 drop-shadow-2xl">
          Snaplink
        </h1>
        <p className="text-lg text-gray-300 font-light drop-shadow-lg">
          Save the links that matter — like your own personal bookmark vault.
        </p>
      </header>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-10 shadow-white/10">
        <h2 className="text-3xl font-light text-center mb-8 text-white drop-shadow-lg">
          {loading ? "Sending OTP..." : "Forgot Password"}
        </h2>
        <p className="text-lg text-gray-300 text-center mb-8 drop-shadow-sm">
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
            <label
              htmlFor="email"
              className="block text-lg font-medium mb-3 text-gray-200 drop-shadow-sm"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-4 rounded-xl bg-black/40 text-white placeholder-gray-400 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/70 focus:border-white/70 focus:shadow-lg focus:shadow-white/20 transition-all duration-300"
              placeholder="Enter your email address"
            />
          </div>

          <button
            type="submit"
            disabled={buttonDisabled || loading}
            className="w-full py-4 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-white/30 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none drop-shadow-lg"
          >
            {loading ? "Sending OTP..." : "Send Reset OTP"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="text-gray-300 hover:text-white hover:drop-shadow-md underline-offset-4 hover:underline transition-all duration-200"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
