import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/auth"; 

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
    return response.data; // Expected to return { user, token }
  } catch (error) {
    throw error.response ? error.response.data : { message: "Server error" };
  }
};
