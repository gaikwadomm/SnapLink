import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import axiosInstance from "../../utils/axiosInstance.js";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const onClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || "";

  const [data, setData] = useState({
    email: emailFromState,
    otp: "",
    newPassword: "",
  });
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const onResetPassword = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/v1/users/reset-password", {
        email: data.email,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      toast.success("Password reset successful!");
      console.log("Reset password response:", response.data);
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while resetting password."
      );
      console.error("Reset password error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { email, otp, newPassword } = data;
    setButtonDisabled(!(email && otp && newPassword));
  }, [data]);

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
          {loading ? "Resetting Password..." : "Reset Password"}
        </h2>
        <p className="text-lg text-gray-300 text-center mb-8 drop-shadow-sm">
          Enter the OTP sent to your email and create a new password.
        </p>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            onResetPassword();
          }}
        >
          <div>
            <label
              htmlFor="email"
              className="block text-lg font-medium mb-3 text-gray-200 drop-shadow-sm"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              required
              className="w-full px-5 py-4 rounded-xl bg-black/40 text-white placeholder-gray-400 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/70 focus:border-white/70 focus:shadow-lg focus:shadow-white/20 transition-all duration-300"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label
              htmlFor="otp"
              className="block text-lg font-medium mb-3 text-gray-200 drop-shadow-sm"
            >
              OTP
            </label>
            <input
              type="text"
              id="otp"
              value={data.otp}
              onChange={(e) => setData({ ...data, otp: e.target.value })}
              required
              maxLength="6"
              className="w-full px-5 py-4 rounded-xl bg-black/40 text-white placeholder-gray-400 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/70 focus:border-white/70 focus:shadow-lg focus:shadow-white/20 transition-all duration-300"
              placeholder="Enter 6-digit OTP"
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-lg font-medium mb-3 text-gray-200 drop-shadow-sm"
            >
              New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="newPassword"
              value={data.newPassword}
              onChange={(e) =>
                setData({ ...data, newPassword: e.target.value })
              }
              required
              className="w-full px-5 py-4 rounded-xl bg-black/40 text-white placeholder-gray-400 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/70 focus:border-white/70 focus:shadow-lg focus:shadow-white/20 transition-all duration-300"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <button
              type="button"
              onClick={onClickShowPassword}
              className="text-gray-300 hover:text-white hover:drop-shadow-md underline-offset-4 hover:underline transition-all duration-200"
            >
              {showPassword ? "Hide" : "Show"} Password
            </button>
          </div>

          <button
            type="submit"
            disabled={buttonDisabled || loading}
            className="w-full py-4 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-white/30 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none drop-shadow-lg"
          >
            {loading ? "Resetting Password..." : "Reset Password"}
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
