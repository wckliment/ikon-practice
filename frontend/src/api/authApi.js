import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/auth";

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, { email, password });

    console.log("Login Response:", response.data); // ✅ Debugging step

    return response.data; // Expected format: { user: { name: "Chase", ... }, token: "..." }
  } catch (error) {
    console.error("Login Error:", error.response?.data || "Server error");
    throw error.response ? error.response.data : { message: "Server error" };
  }
};
