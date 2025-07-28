import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import axiosInstance from "../../utils/axiosInstance.js";
import toast from "react-hot-toast";

export default function ResetPassword() {
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
                newPassword: data.newPassword
            });
            toast.success("Password reset successful!");
            console.log("Reset password response:", response.data);
            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (error) {
            toast.error(
                error.response?.data?.message || "An error occurred while resetting password."
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-neutral-900 to-black text-white px-4">
            <header className="mb-6 text-center">
                <h1 className="text-4xl font-semibold text-white tracking-wide">Snaplink</h1>
                <p className="mt-1 text-sm text-gray-400">
                    Save the links that matter — like your own personal bookmark vault.
                </p>
            </header>

            <div className="w-full max-w-md bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-center mb-6">
                    {loading ? "Resetting Password..." : "Reset Password"}
                </h2>
                <p className="text-sm text-gray-400 text-center mb-6">
                    Enter the OTP sent to your email and create a new password.
                </p>

                <form onSubmit={(e) => { e.preventDefault(); onResetPassword(); }}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={data.email}
                            onChange={(e) => setData({ ...data, email: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-neutral-900 text-white placeholder-gray-500 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="Enter your email address"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="otp" className="block text-sm font-medium mb-2">OTP</label>
                        <input
                            type="text"
                            id="otp"
                            value={data.otp}
                            onChange={(e) => setData({ ...data, otp: e.target.value })}
                            required
                            maxLength="6"
                            className="w-full px-4 py-3 rounded-lg bg-neutral-900 text-white placeholder-gray-500 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="Enter 6-digit OTP"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="newPassword" className="block text-sm font-medium mb-2">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={data.newPassword}
                            onChange={(e) => setData({ ...data, newPassword: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-neutral-900 text-white placeholder-gray-500 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="Enter new password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={buttonDisabled || loading}
                        className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold hover:from-yellow-500 hover:to-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Resetting Password..." : "Reset Password"}
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