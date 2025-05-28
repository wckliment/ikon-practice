import { loginSuccess } from "./authSlice";
import { loginUser } from "../api/authApi";

export const handleLogin = (email, password) => async (dispatch) => {
  try {
    console.log("Attempting login..."); // Debugging
    const data = await loginUser(email, password);
    console.log("Login successful:", data); // Debugging
    dispatch(loginSuccess(data));

    // Store both tokens in localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("userId", data.user.id);
  } catch (error) {
    console.error("Login failed:", error.message);
  }
};

// Add refresh token function
export const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  // ✅ Exit early without throwing if no refresh token — safe for tablet
  if (!refreshToken) {
    console.warn("No refresh token available — skipping refresh.");
    return null;
  }

  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);

    return data.token;
  } catch (error) {
    console.error("Token refresh failed:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    throw error;
  }
};
