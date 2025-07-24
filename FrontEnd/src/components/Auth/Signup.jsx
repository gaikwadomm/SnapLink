import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function Signup() {
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
      const response = await axios.post("/api/v1/users/register", user);
      toast.success("Signup successful! Redirecting to login page...");
      console.log("Signup response:", response.data);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-neutral-900 to-black text-white px-4">
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
      />
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
          {loading ? "Processing..." : "Create your account"}
        </h2>

        <form
          className="space-y-4"
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
            className="w-full px-4 py-3 rounded-lg bg-neutral-900 text-white placeholder-gray-500 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
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
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-gray-400">
          Already have an account?
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="ml-2 text-amber-400 hover:underline font-medium"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
