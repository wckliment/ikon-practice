import { loginSuccess } from "./authSlice";
import { loginUser } from "../api/authApi";

export const handleLogin = (email, password) => async (dispatch) => {
  try {
    console.log("Attempting login..."); // Debugging
    const data = await loginUser(email, password);
    console.log("Login successful:", data); // Debugging

    dispatch(loginSuccess(data));

    // Store the token in localStorage
    localStorage.setItem("token", data.token);
  } catch (error) {
    console.error("Login failed:", error.message);
  }
};
