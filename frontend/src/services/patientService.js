import axios from "axios";

const patientService = {
  async createPatient(patientData) {
    try {
      const response = await axios.post("/api/patients", patientData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (localStorage.getItem("token") || "no-token"),
        },
      });
      return response.data;
    } catch (error) {
      console.error("❌ Failed to create patient:", error);
      throw error;
    }
  },

  async searchPatients(searchTerm) {
    try {
      const response = await axios.get(`/api/patients?search=${encodeURIComponent(searchTerm)}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (localStorage.getItem("token") || "no-token"),
        },
      });
      return response.data;
    } catch (error) {
      console.error("❌ Failed to search patients:", error);
      throw error;
    }
  },

  async getPatientById(patNum) {
    try {
      const response = await axios.get(`/api/patients/${patNum}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (localStorage.getItem("token") || "no-token"),
        },
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch patient ${patNum}:`, error);
      throw error;
    }
  },
};

export default patientService;
