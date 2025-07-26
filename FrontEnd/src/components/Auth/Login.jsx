import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/v1/users/login", user);
      toast.success("Login successful!...");
      console.log("Signup response:", response.data);
      setTimeout(() => {
        navigate("/UserLinks");
      }, 1000);
    } catch (error) {
      toast.error("An error occurred while login...");
      if (error instanceof Error) {
        console.error("Login error:", error.message);
      } else {
        console.error("Login error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { email, password } = user;
    setButtonDisabled(!(email && password));
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-neutral-900 to-black text-white px-4">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-semibold text-white tracking-wide">
          Snaplink
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Save the links that matter — like your own personal bookmark vault.
        </p>
      </header>

      {/* Auth card */}
      <div className="w-full max-w-md bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          {loading ? "Processing..." : "Login to your account"}
        </h2>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!buttonDisabled) {
              onLogin();
            }
          }}
        >
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              style: {
                background: "#23272a",
                color: "#fff",
                borderRadius: "8px",
                border: "1px solid #FFD580",
                boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                fontSize: "1rem",
                padding: "16px 24px",
              },
              success: {
                iconTheme: {
                  primary: "#FFD580",
                  secondary: "#23272a",
                },
                style: {
                  border: "1px solid #FFD580",
                  background: "#23272a",
                  color: "#FFD580",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ff4d4f",
                  secondary: "#23272a",
                },
                style: {
                  border: "1px solid #ff4d4f",
                  background: "#23272a",
                  color: "#ff4d4f",
                },
              },
            }}
          />{" "}
          <input
            id="email"
            type="email"
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            placeholder="Email address"
            className="w-full px-4 py-3 rounded-lg bg-neutral-900 text-white placeholder-gray-500 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            id="password"
            type="password"
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg bg-neutral-900 text-white placeholder-gray-500 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="form-checkbox accent-amber-500"
              />
              Remember me
            </label>
            <a href="#" className="text-amber-400 hover:underline">
              Forgot Password?
            </a>
          </div>
          <button
            type="submit"
            disabled={buttonDisabled}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold hover:from-yellow-500 hover:to-amber-600 transition"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-gray-400">
          Don't have an account?
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="ml-2 text-amber-400 hover:underline font-medium"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
