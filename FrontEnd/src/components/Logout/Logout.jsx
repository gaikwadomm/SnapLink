import React, { useState } from "react";
import { useNavigate } from "react-router";
import axiosInstance from "../../utils/axiosInstance.js";
import toast from "react-hot-toast";

export default function Logout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/v1/users/logout");
      toast.success("Logged out successfully!");
      console.log("Logout response:", response.data);

      // Clear any local storage or session storage if you have any
      localStorage.removeItem("user");
      sessionStorage.clear();

      // Redirect to login page
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred while logging out"
      );
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
