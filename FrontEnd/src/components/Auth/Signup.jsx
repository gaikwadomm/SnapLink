import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import axiosInstance from "../../utils/axiosInstance.js";
import toast, { Toaster } from "react-hot-toast";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const onClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  const navigate = useNavigate();
  const [user, setUser] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/v1/users/register", user);
      toast.success(
        "Registration initiated! Please check your email for verification code."
      );
      console.log("Signup response:", response.data);

      // Redirect to verify OTP page with email in state
      navigate("/verify-otp", {
        state: {
          email: user.email,
        },
      });
    } catch (error) {
      toast.error(
        error.response.data.message || "An error occurred while signing up."
      );
      if (error instanceof Error) {
        console.error("Signup error:", error);
      } else {
        console.error("Signup error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { email, password, username } = user;
    setButtonDisabled(!(email && password && username));
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white px-4">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-white tracking-wider mb-2 drop-shadow-2xl">
          Snaplink
        </h1>
        <p className="text-lg text-gray-300 font-light drop-shadow-lg">
          Save the links that matter — like your own personal bookmark vault.
        </p>
      </header>
      {/* Auth card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-10 shadow-white/10">
        <h2 className="text-3xl font-light text-center mb-8 text-white drop-shadow-lg">
          {loading ? "Creating account..." : "Create your account"}
        </h2>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            onSignup();
          }}
        >
          <input
            id="username"
            type="text"
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            placeholder="Username"
            className="w-full px-5 py-4 rounded-xl bg-black/40 text-white placeholder-gray-400 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/70 focus:border-white/70 focus:shadow-lg focus:shadow-white/20 transition-all duration-300"
          />
          <input
            id="email"
            type="email"
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            placeholder="Email address"
            className="w-full px-5 py-4 rounded-xl bg-black/40 text-white placeholder-gray-400 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/70 focus:border-white/70 focus:shadow-lg focus:shadow-white/20 transition-all duration-300"
          />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            placeholder="Password"
            className="w-full px-5 py-4 rounded-xl bg-black/40 text-white placeholder-gray-400 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/70 focus:border-white/70 focus:shadow-lg focus:shadow-white/20 transition-all duration-300"
          />

          <div className="flex items-center justify-between text-sm">
            <div>
              <button
                type="button"
                onClick={onClickShowPassword}
                className="text-gray-300 hover:text-white hover:drop-shadow-md underline-offset-4 hover:underline transition-all duration-200"
              >
                {showPassword ? "Hide" : "Show"} Password
              </button>
            </div>
            <Link
              to="/forgot-password"
              className="text-gray-300 hover:text-white hover:drop-shadow-md underline-offset-4 hover:underline transition-all duration-200"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={buttonDisabled || loading}
            className="w-full py-4 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-white/30 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none drop-shadow-lg"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-300">
          Already have an account?
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="ml-2 text-white hover:text-gray-300 hover:drop-shadow-md underline-offset-4 hover:underline font-medium transition-all duration-200"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
