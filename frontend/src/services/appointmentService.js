import axios from "axios";
import { findProcedureCode } from "../../../common/utils/procedureCodeMapper";

const appointmentService = {
  async getAppointments(startDate, endDate, providerId = null) {
    try {
      const formattedStart = startDate.toISOString().split("T")[0];
      const formattedEnd = endDate.toISOString().split("T")[0];
      let url = `/api/appointments?startDate=${formattedStart}&endDate=${formattedEnd}`;
      if (providerId) url += `&providerId=${providerId}`;

      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (localStorage.getItem("token") || "no-token"),
        },
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error("❌ API CALL FAILED:", error);
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
      return null;
    }
  },

  async getPatientsByIds(patNums) {
    try {
      const response = await axios.post(
        "/api/patients/batch",
        { patNums },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + (localStorage.getItem("token") || "no-token"),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("❌ Failed to batch fetch patients:", error);
      return [];
    }
  },

  async createAppointment(appointmentData) {
    try {
      if (!appointmentData.description) {
        throw new Error("❌ Procedure is required for appointment creation");
      }

      appointmentData.procedure = appointmentData.procedure || appointmentData.description;

      const formattedData = {
        PatNum: appointmentData.patientId,
        ProvNum: appointmentData.providerId,
        AptDateTime: appointmentData.aptDateTime,
        Pattern: "X".repeat(appointmentData.duration / 5),
        AptStatus: "Scheduled",
        Op: appointmentData.operatoryId || 1,
        Note: appointmentData.notes || "",
        ProcDescript: appointmentData.procedure,
        description: appointmentData.procedure,
      };

      const response = await axios.post("/api/appointments", formattedData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (localStorage.getItem("token") || "no-token"),
        },
      });

      const createdAppointment = response.data;
      const appointmentId = createdAppointment?.AptNum || createdAppointment?.id;

      // Create procedure log(s)
      if (appointmentId && appointmentData.procedure) {
        const codeEntry = findProcedureCode(appointmentData.procedure);
        const procedureLogs = Array.isArray(codeEntry) ? codeEntry : [codeEntry];

        for (const log of procedureLogs) {
          if (!log?.ProcCode) continue;

          const payload = {
            AptNum: appointmentId,
            PatNum: appointmentData.patientId,
            ProcCode: log.ProcCode,
            ProvNum: appointmentData.providerId,
            Descript: log.Descript || appointmentData.procedure,
            status: "TP",
          };

          await axios.post("/api/appointments/procedurelogs", payload, {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + (localStorage.getItem("token") || "no-token"),
            },
          });
        }
      }

      return createdAppointment;
    } catch (error) {
      console.error("❌ Failed to create appointment:", error.message, error.stack);
      throw error;
    }
  },

  async updateAppointment(appointmentData) {
    try {
      const formattedData = {};

      if (appointmentData.providerId) formattedData.ProvNum = appointmentData.providerId;
      if (appointmentData.aptDateTime) formattedData.AptDateTime = appointmentData.aptDateTime;
      if (appointmentData.notes) formattedData.Note = appointmentData.notes;
      if (appointmentData.procedure) {
        formattedData.ProcDescript = appointmentData.procedure;
        formattedData.procedure = appointmentData.procedure;
        formattedData.description = appointmentData.procedure;
      }
      if (appointmentData.duration) {
        formattedData.Pattern = "X".repeat(appointmentData.duration / 5);
      }
      if (appointmentData.operatoryId) formattedData.Op = appointmentData.operatoryId;

      const response = await axios.put(`/api/appointments/${appointmentData.id}`, formattedData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (localStorage.getItem("token") || "no-token"),
        },
      });

      return response.data;
    } catch (error) {
      console.error("❌ Failed to update appointment:", error);
      throw error;
    }
  },

  async updateAppointmentNotes(appointmentId, notes) {
    try {
      const response = await axios.put(`/api/appointments/${appointmentId}/Note`, {
        Note: notes,
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (localStorage.getItem("token") || "no-token"),
        },
      });
      return response.data;
    } catch (error) {
      console.error("❌ Failed to update appointment notes:", error);
      throw error;
    }
  },

  async updateAppointmentConfirmation(appointmentId, confirmStatus) {
    try {
      const response = await axios.put(`/api/appointments/${appointmentId}/Confirm`, {
        confirmVal: confirmStatus,
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (localStorage.getItem("token") || "no-token"),
        },
      });
      return response.data;
    } catch (error) {
      console.error("❌ Failed to update confirmation:", error);
      throw error;
    }
  },

  async getProceduresByAppointment(appointmentId) {
    try {
      const response = await axios.get(`/api/appointments/${appointmentId}/procedures`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (localStorage.getItem("token") || "no-token"),
        },
      });
      return response.data.data;
    } catch (error) {
      console.error("❌ Failed to fetch procedures:", error);
      throw error;
    }
  },

  async updateProcedure(procNum, procedureData) {
    try {
      const payload = {
        ProcCode: procedureData.ProcCode || procedureData.procCode,
        Descript: procedureData.Descript || procedureData.descript || "",
        status: procedureData.status || "TP"
      };

      const response = await axios.put(`/api/appointments/procedurelogs/${procNum}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (localStorage.getItem("token") || "no-token"),
        },
      });
      return response.data.data;
    } catch (error) {
      console.error("❌ Failed to update procedure:", error);
      throw error;
    }
  }
};

export default appointmentService;
