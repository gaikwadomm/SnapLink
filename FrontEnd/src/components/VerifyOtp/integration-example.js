// Example of how to update your registration component to redirect to VerifyOtp

// In your registration component (SignUp.jsx), after successful registration:

const handleRegistration = async (formData) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/register`,
      formData,
      { withCredentials: true }
    );

    if (response.data.success) {
      toast.success(
        "Registration initiated! Please check your email for verification code."
      );

      // Navigate to VerifyOtp with email in state
      navigate("/verify-otp", {
        state: {
          email: formData.email,
        },
      });
    }
  } catch (error) {
    // Handle error
    console.error("Registration error:", error);
    toast.error(error.response?.data?.message || "Registration failed");
  }
};

// Make sure to add the route in your App.jsx or router configuration:
// <Route path="/verify-otp" element={<VerifyOtp />} />
