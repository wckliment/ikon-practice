import React, { useState, useEffect, useCallback } from "react";
import ReactSelect from "react-select";
import { toast } from "react-toastify";
import { Calendar, Clock, User, Filter, ChevronLeft, ChevronRight } from "react-feather";
import { debounce } from "lodash";
import { useSelector, useDispatch } from "react-redux";
import { fetchProviders } from "../redux/providersSlice";
import { fetchUsers } from "../redux/settingsSlice";
import { fetchLocations } from "../redux/settingsSlice";
import { fetchOperatories } from "../redux/operatoriesSlice";
import { findProcedureCode } from "../../../common/utils/procedureCodeMapper";
import UpdateAppointmentModal from "../components/UpdateAppointmentModal";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import confirmationStatusMap from "../../constants/confirmationStatusMap";
import { socket, connectSocket } from "../socket";



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
      console.log("🛰 Raw API Response:", response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error("❌ API CALL FAILED:", error);
      throw error;
    }
  },

  // Fetch a patient by PatNum
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

  async createAppointment(appointmentData) {
  try {
    console.log("📅 [STEP 1] Creating new appointment with data:", appointmentData);

    if (!appointmentData.description) {
      throw new Error("❌ Procedure is required for appointment creation");
    }

    // ✅ Fix: Ensure procedure is populated from description
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

    console.log("📦 Formatted appointment payload:", formattedData);

    const response = await axios.post('/api/appointments', formattedData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + (localStorage.getItem("token") || "no-token"),
      },
    });

    const createdAppointment = response.data;
    const appointmentId = createdAppointment?.AptNum || createdAppointment?.id;

    console.log("✅ [STEP 1 COMPLETE] Appointment created:", createdAppointment);

    // 🔎 STEP 2: Create procedure log(s)
    if (appointmentId && appointmentData.procedure) {
      console.log("🧠 [STEP 2] Mapping procedure label:", appointmentData.procedure);

      const codeEntry = findProcedureCode(appointmentData.procedure);
      const procedureLogs = Array.isArray(codeEntry) ? codeEntry : [codeEntry];

      console.log("📋 Mapped procedure(s):", procedureLogs);

      for (const log of procedureLogs) {
        if (!log?.ProcCode) {
          console.warn("⚠️ Skipping invalid procedure log entry:", log);
          continue;
        }

        const payload = {
          AptNum: appointmentId,
          PatNum: appointmentData.patientId,
          ProcCode: log.ProcCode,
          ProvNum: appointmentData.providerId,
          Descript: log.Descript || appointmentData.procedure,
          status: "TP",
        };

        console.log("📤 Sending procedure log payload:", payload);

        await axios.post(`/api/appointments/procedurelogs`, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + (localStorage.getItem("token") || "no-token"),
          },
        });

        console.log(`✅ Procedure log created: ${log.ProcCode} (${log.Descript})`);
      }
    } else {
      console.warn("⚠️ No procedure label provided or appointment ID missing.");
    }

    return createdAppointment;
  } catch (error) {
    console.error("❌ Failed to create appointment:", error.message, error.stack);
    throw error;
  }
}
,


async updateAppointment(appointmentData) {
  try {
    console.log("📅 Updating appointment:", appointmentData);

    // Format the data to match Open Dental API expectations
    const formattedData = {};

    // Map your frontend fields to Open Dental API fields
    if (appointmentData.providerId) formattedData.ProvNum = appointmentData.providerId;
    if (appointmentData.aptDateTime) formattedData.AptDateTime = appointmentData.aptDateTime;
    if (appointmentData.notes) formattedData.Note = appointmentData.notes;

    // Try both field names for procedure since we're not sure which one works
    if (appointmentData.procedure) {
      formattedData.ProcDescript = appointmentData.procedure;
      // Some APIs might use this field name instead
      formattedData.procedure = appointmentData.procedure;
      formattedData.description = appointmentData.procedure;
    }

    // Create pattern based on duration (5min increments) if duration is provided
    if (appointmentData.duration) {
      formattedData.Pattern = "X".repeat(appointmentData.duration / 5);
    }

    // Add other fields if needed
    if (appointmentData.operatoryId) formattedData.Op = appointmentData.operatoryId;

    console.log("Formatted data being sent:", formattedData);

    const response = await axios.put(`/api/appointments/${appointmentData.id}`, formattedData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + (localStorage.getItem("token") || "no-token"),
      },
    });

    console.log("✅ Appointment updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to update appointment:", error);
    throw error;
  }
},

// Method to specifically update the notes
async updateAppointmentNotes(appointmentId, notes) {
  try {
    console.log(`📝 Updating notes for appointment ${appointmentId}`);

    const response = await axios.put(`/api/appointments/${appointmentId}/Note`, {
      Note: notes
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + (localStorage.getItem("token") || "no-token"),
      },
    });

    console.log("✅ Appointment notes updated successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to update appointment notes:", error);
    throw error;
  }
},

// Method to update appointment confirmation status
async updateAppointmentConfirmation(appointmentId, confirmStatus) {
  try {
    console.log(`🔔 Updating confirmation status for appointment ${appointmentId}`);

    const response = await axios.put(`/api/appointments/${appointmentId}/Confirm`, {
      confirmVal: confirmStatus
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + (localStorage.getItem("token") || "no-token"),
      },
    });

    console.log("✅ Appointment confirmation updated successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to update appointment confirmation:", error);
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
    // Capitalize keys if needed
    const payload = {
      ProcCode: procedureData.ProcCode || procedureData.procCode,
      Descript: procedureData.Descript || procedureData.descript || "",
      status: procedureData.status || "TP"
    };

    console.log(`📝 Updating procedure ${procNum} with payload:`, payload);

    const response = await axios.put(`/api/appointments/procedurelogs/${procNum}`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + (localStorage.getItem("token") || "no-token"),
      },
    });

    console.log("✅ Procedure updated successfully:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("❌ Failed to update procedure:", error);
    throw error;
  }
}

};


const procedureOptions = [
  { value: "Ex.Pro.Flo", label: "Ex.Pro.Flo" },
  { value: "Exam", label: "Exam" },
  { value: "Prophy-Adult", label: "Prophy-Adult" },
  { value: "Flo-Adult", label: "Flo-Adult" },
  { value: "PA", label: "PA" },
  { value: "2 BWX", label: "2 BWX" },
  { value: "4 BWX", label: "4 BWX" },
  { value: "Pano", label: "Pano" },
  { value: "Office Visit", label: "Office Visit" }
];

// 🕒 Utility function to parse Open Dental date/times as local
const parseLocalDateTime = (isoString) => {
  if (!isoString || !isoString.includes("T")) return null;
  const [datePart, timePart] = isoString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second = 0] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, second);
};



const Appointments = () => {
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentMonthName, setCurrentMonthName] = useState("");
  const [notes, setNotes] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { list: providers, loading: providersLoading } = useSelector((state) => state.providers);
  const users = useSelector((state) => state.settings.users.data);
  const fullState = useSelector((state) => state);
console.log("🧠 Full Redux state (debug):", fullState);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const operatories = useSelector((state) => state.operatories?.list || []);


  useEffect(() => {
    dispatch(fetchProviders());
    dispatch(fetchUsers());
    dispatch(fetchLocations());
    dispatch(fetchOperatories());
  }, [dispatch]);

  const staffMembers = providers.map((prov) => ({
    id: prov.ProvNum,
    name: prov.Abbr,
    fullName: `${prov.FName} ${prov.LName}`.trim(),
    color: `rgb(${prov.provColor})`,
  }));

  const handleCreateAppointment = async (e) => {
  e.preventDefault();

 // Enhanced validation including procedure
  if (!newAppointment.patientId || !newAppointment.providerId ||
      !newAppointment.date || !newAppointment.startTime || !newAppointment.procedure) {
    alert("Please fill in all required fields including procedure");
    return;
  }

  try {
    // Show loading state
    setIsLoading(true);

    // Format date and time properly for Open Dental
    // The API expects ISO format: "YYYY-MM-DDThh:mm:ss"
    const formattedDateTime = `${newAppointment.date}T${newAppointment.startTime}:00`;

    // Calculate duration in minutes and create appropriate pattern
    const durationMinutes = parseInt(newAppointment.duration) || 15;

    // Create appointment data object
    const appointmentData = {
      patientId: newAppointment.patientId,
      providerId: newAppointment.providerId,
      aptDateTime: formattedDateTime,
      duration: durationMinutes,
      operatoryId: newAppointment.operatoryId || 0, // Default to 0 if not selected
      notes: newAppointment.notes || "",
      description: newAppointment.description || "Appointment"
    };

    // Call the create appointment API
    await appointmentService.createAppointment(appointmentData);

    // Reset form and close modal
    setNewAppointment({
      patientId: '',
      providerId: '',
      date: '',
      startTime: '',
      duration: 15,
      operatoryId: 0,
      notes: '',
      description: ''
    });

    setShowCreateModal(false);

    // Refresh appointments display
    fetchAppointments();

    // Optionally show success message
    alert("Appointment created successfully!");

  } catch (error) {
    console.error("Error creating appointment:", error);
    alert("Failed to create appointment. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

const [newAppointment, setNewAppointment] = useState({
  patientId: '',
  providerId: '',
  date: '',
  startTime: '',
  duration: 15, // default 15 minutes
  operatoryId: 0,
  notes: '',
  description: ''
});


const handleUpdateAppointment = async (updatedData) => {
  try {
    setIsLoading(true);

    if (!updatedData.id && selectedAppointment) {
      updatedData.id = selectedAppointment.id;
    }

    await appointmentService.updateAppointment(updatedData);

    let updatedProcedure = false;

    if (updatedData.procedure && updatedData.procedure !== selectedAppointment.type) {
      try {
        console.log("Fetching procedures for appointment:", updatedData.id);
        const procedures = await appointmentService.getProceduresByAppointment(updatedData.id);
        console.log("Found procedures:", procedures);

        if (procedures && procedures.length > 0) {
          const mainProcedure = procedures[0];
          console.log("Updating procedure:", mainProcedure.ProcNum);

          const mapped = findProcedureCode(updatedData.procedure);
          if (!mapped) {
            console.warn("❌ No procedure code mapping found for:", updatedData.procedure);
          }

          const procedurePayload = {
            ProcCode: mapped?.ProcCode || updatedData.procedure,
            Descript: mapped?.Descript || updatedData.procedure,
            status: "TP"
          };

          await appointmentService.updateProcedure(mainProcedure.ProcNum, procedurePayload);
          console.log("✅ Procedure update successful");
          updatedProcedure = true;
        } else {
          console.log("No procedures found to update");
        }
      } catch (procError) {
        console.error("❌ Error updating procedure:", procError);
      }
    }

    setShowUpdateModal(false);

    // ✅ Refresh appointments so UI reflects change
    await fetchAppointments();

    // ✅ Trigger toast after success
    toast.success("✅ Appointment updated successfully!");

  } catch (error) {
    console.error("Error updating appointment:", error);
    alert("Failed to update appointment. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (token && !socket.connected) {
    connectSocket(token); // ← calls socket.connect() and sets auth
  }
  }, []);

  useEffect(() => {
  // 🧠 Only attach the listener once
  const handleAppointmentUpdate = () => {
    console.log("📡 Received appointment update via socket");
    fetchAppointments(); // 🔁 Re-fetch to get fresh data
  };

  socket.on("appointmentUpdated", handleAppointmentUpdate);

  // 🧹 Clean up on unmount
  return () => {
    socket.off("appointmentUpdated", handleAppointmentUpdate);
  };
}, []);



  useEffect(() => {
    const options = { month: "long", year: "numeric" };
    setCurrentMonthName(currentMonth.toLocaleDateString("en-US", options));
  }, [currentMonth]);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, currentMonth]);
  

const transformAppointmentData = async (apiAppointments, users = []) => {
  const transformed = [];

  // 🔧 Build color map with string keys
  const providerColorMap = {};
  users.forEach((user) => {
    if (user.provider_id && user.appointment_color) {
      providerColorMap[String(user.provider_id)] = user.appointment_color;
    }
  });

  // 🎨 Status colors based on readable status
  const statusColors = {
    "Unconfirmed": "#9ca3af",
    "Confirmed": "#3b82f6",
    "Arrived": "#10b981",
    "Ready to go Back": "#facc15",
    "In Treatment Room": "#f97316",
    "Check Out": "#ef4444",
    "Unknown": "#9ca3af"
  };

  for (const apt of apiAppointments) {
    console.log("🔍 Full appointment object:", apt);
    console.log("🔍 Raw appointment from API:", {
      id: apt.id || apt.AptNum,
      procedureDescription: apt.procedureDescription
    });

    const startTimeRaw = apt.startTime || apt.AptDateTime;
    const startTime = parseLocalDateTime(startTimeRaw);
    console.log("📅 Parsed local startTime:", startTime?.toString());

    if (!startTime) {
      console.warn("⚠️ Invalid or missing start time format for appointment:", apt);
      continue;
    }

    const isoDate = startTime.toISOString();
    console.log("📦 ISO string being used for detail panel:", isoDate);

    const localDate =
      startTime.getFullYear() + "-" +
      String(startTime.getMonth() + 1).padStart(2, "0") + "-" +
      String(startTime.getDate()).padStart(2, "0");

    console.log("📆 Local date (fixed):", localDate);

    // 🧾 Log providerId for debugging
    const providerId = apt.providerId || apt.ProvNum;

    // ✅ Make sure patientName is declared before using it
    let patientName = `Patient #${apt.patientId}`;
    try {
      if (apt.patientId) {
        const patient = await appointmentService.getPatientById(apt.patientId);
        if (patient && (patient.FName || patient.LName)) {
          patientName = `${patient.FName || ""} ${patient.LName || ""}`.trim();
        } else {
          console.warn("⚠️ No patient data returned for PatNum:", apt.patientId);
        }
      }
    } catch (err) {
      console.warn(`⚠️ Failed to fetch patient ${apt.patientId}:`, err);
    }

    // ✅ Safe to log now
    if (localDate === "2025-04-15") {
      console.log("📌 April 15 Appointment:", {
        patient: patientName,
        providerId,
        operatoryId: apt.Op || apt.operatoryId,
        date: localDate,
        startTime: startTime.toString(),
        raw: apt
      });
    }

    const durationInMinutes = apt.pattern?.length ? apt.pattern.length * 5 : 60;
    const endTime = new Date(startTime.getTime() + durationInMinutes * 60000);
    const pixelsPerMinute = 2.4;
    const height = durationInMinutes * pixelsPerMinute;

    const resolvedColor = providerColorMap[String(providerId)] || `rgb(${apt.provColor || "249,231,160"})`;
    const readableStatus = apt.confirmationLabel || apt.status || "Unknown";
    const statusColor = statusColors[readableStatus] || "#9ca3af";

    transformed.push({
      id: apt.id || apt.AptNum,
      patientName,
      date: localDate,
      startTime: startTime,
      fullStartTime: startTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }),
      endTime: endTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }),
      duration: durationInMinutes,
      height,
      type:
        apt.ProcDescript ||
        apt.procedureDescription ||
        apt.procedure ||
        apt.description ||
        "",
      notes: apt.notes || apt.Note || "",
      status: readableStatus,
      statusColor,
      staff: apt.providerName || apt.provAbbr || `Provider #${providerId}`,
      providerId,
      color: resolvedColor,
      procedureLogs: apt.procedureLogs || [],
      operatoryId: apt.Op || apt.operatoryId || null,
      startTimeDate: startTime
    });
  }

  return transformed;
};


  const fetchAppointments = async () => {
    try {
      setIsLoading(true);

      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      //  Log raw API response
      const appointmentsData = await appointmentService.getAppointments(startOfMonth, endOfMonth);


      //  Await transformed appointments (because it now fetches patient data)
      const transformedAppointments = await transformAppointmentData(appointmentsData, users);


      setAppointments(transformedAppointments);

      if (transformedAppointments.length > 0 && !selectedAppointment) {
        const first = transformedAppointments.find(
          (apt) => apt.date === selectedDate.toISOString().split("T")[0]
        );
        if (first) {
          setSelectedAppointment(first);
          setNotes(first.notes || "");
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
      setIsLoading(false);
    }
  };


  const getAppointmentsForTimeAndStaff = (time, staff) => {
    return appointments.filter((app) => {
      const timeMatches = app.fullStartTime === time;
      const staffMatches = app.staff === staff.name;
      const dateMatches = app.date === selectedDate.toISOString().split("T")[0];
      return timeMatches && staffMatches && dateMatches;
    });
  };

  const timeSlots = [];

  for (let hour = 7; hour <= 19; hour++) {
    for (let minute = 0; minute < 60; minute += 10){
      const displayHour = hour > 12 ? hour - 12 : hour;
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayMinute = minute === 0 ? "00" : minute.toString().padStart(2, "0");
      timeSlots.push(`${displayHour}:${displayMinute} ${ampm}`);
    }
  }


  const isToday = (day) => {
    return (
      day === new Date().getDate() &&
      currentMonth.getMonth() === new Date().getMonth() &&
      currentMonth.getFullYear() === new Date().getFullYear()
    );
  };

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const handleDaySelect = (day) => {
    if (!day) return;
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
  };



  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const saveNotes = async () => {
    if (!selectedAppointment) return;

    try {

      await appointmentService.updateAppointmentExtension?.(selectedAppointment.id, { internalNotes: notes });

      setSelectedAppointment({
        ...selectedAppointment,
        notes: notes,
      });

      fetchAppointments();
    } catch (error) {
      console.error("❌ Error saving notes:", error);
    }
  };

  const generateCalendarDays = () => {
    const days = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const startingDay = firstDay.getDay();

    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }

    return days;
  };

const fetchAndSetSelectedAppointment = async (appointmentId) => {
  try {
    const response = await axios.get(`/api/appointments/${appointmentId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + (localStorage.getItem("token") || "no-token"),
      },
    });

    if (response.data && response.data.success) {
      const apt = response.data.data;

      if (response.data && response.data.success) {
        const apt = response.data.data;

        // 🔎 Fetch procedure logs separately
        const procedureRes = await axios.get(`/api/appointments/${appointmentId}/procedures`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + (localStorage.getItem("token") || "no-token"),
          },
        });

        const procedureLogs = procedureRes.data?.data || [];

        console.log("🧾 Procedure logs fetched:", procedureLogs);

        const normalizedDateTime = apt.startTime?.replace(" ", "T") || apt.AptDateTime?.replace(" ", "T");
        const start = new Date(normalizedDateTime);
        const duration = apt.pattern?.length ? apt.pattern.length * 5 : 30;
        const end = new Date(start.getTime() + duration * 60000);



        const readableStatus = apt.confirmationLabel || apt.status || "Unknown";

        const statusColors = {
          "Unconfirmed": "#9ca3af",
          "Confirmed": "#3b82f6",
          "Scheduled": "#60a5fa",
          "Arrived": "#10b981",
          "Ready to go Back": "#facc15",
          "In Treatment Room": "#f97316",
          "Check Out": "#ef4444",
          "Unknown": "#9ca3af"
        };

        const statusColor = statusColors[readableStatus] || "#9ca3af";


        let patientName = `Patient #${apt.patientId}`;
        try {
          const patientRes = await appointmentService.getPatientById(apt.patientId);
          if (patientRes?.FName || patientRes?.LName) {
            patientName = `${patientRes.FName || ""} ${patientRes.LName || ""}`.trim();
          }
        } catch (err) {
          console.warn("Could not fetch patient details:", err);
        }

        setSelectedAppointment({
          id: apt.id || apt.AptNum,
          patientName,
          date: start.toISOString().split("T")[0],
          startTime: start.toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
          fullStartTime: start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
          endTime: end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
          duration: duration,
          height: duration * 3.2,
          type: apt.ProcDescript || apt.procedureDescription || "",
          notes: apt.notes || apt.Note || "",
          status: readableStatus,
          statusColor,
          rawStatusCode: apt.Confirmed || apt.confirmed || null,
          staff: apt.providerName || apt.provAbbr || `Provider #${apt.providerId}`,
          providerId: apt.providerId || apt.ProvNum,
          color: `rgb(${apt.provColor || "160,233,249"})`,
          procedureLogs
        });

        setNotes(apt.notes || "");
      }
    }
  } catch (error) {
    console.error("❌ Failed to fetch full appointment:", error);
  }
};

  const handleAppointmentClick = (appointment) => {
  console.log("🖱️ Clicked appointment:", appointment);

  if (!appointment?.id) {
    console.warn("No appointment ID found for selected appointment:", appointment);
    return;
  }

  fetchAndSetSelectedAppointment(appointment.id);
};



   // Debounced function to fetch patients
  const debouncedFetch = useCallback(
    debounce(async (inputValue) => {
      setLoadingPatients(true);
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(`/api/patients`, {
          params: {
            search: inputValue,  // Use the debounced search term
            limit: 50,           // Adjust limit if needed
          },
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        });

        setPatients(response.data);  // Update the patient list
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoadingPatients(false);
      }
    }, 500),  // 500ms debounce delay
    []
  );

    // Trigger the debounced fetch when searchTerm changes
  useEffect(() => {
    if (searchTerm) {
      debouncedFetch(searchTerm);  // Call the debounced function with the search term
    } else {
      setPatients([]);  // Clear patients if no search term
    }
  }, [searchTerm, debouncedFetch]); // Re-run when searchTerm changes


// Update the handleSearchChange function to properly set the patient ID
const handleSearchChange = (selectedOption) => {
  console.log("Patient selected:", selectedOption); // Add this for debugging
  if (selectedOption) {
    setNewAppointment({
      ...newAppointment,
      patientId: selectedOption.value,
    });
  }
};

  const handleSearchInputChange = (inputValue) => {
  setSearchTerm(inputValue);  // Update searchTerm based on user input
};

 // Pass patients as options for ReactSelect
const patientOptions = patients.map((patient) => ({
  label: `${patient.FName} ${patient.LName}`, // Show full name
  value: patient.PatNum,  // Store patient ID in value
}));



  console.log("🧠 Operatories:", operatories);

    return (
  <div className="h-screen" style={{ backgroundColor: "#EBEAE6" }}>
    <Sidebar />

    <div className="ml-20 max-w-[calc(100vw-80px)]" style={{ backgroundColor: "#EBEAE6" }}>
          <TopBar />




          {/* Header */}
          <div className="px-4 pt-0 pb-2 ml-16">
  <h1 className="text-4xl font-bold text-gray-800">Appointments</h1>
</div>


      <div className="p-6 mt-6 ml-10 flex h-[calc(100vh-100px)] overflow-hidden">
        {/* Left Side */}
        <div className="flex flex-col flex-grow overflow-hidden mr-6">
            {/* Filters */}
            <div className="flex space-x-4 mb-4">

            </div>

{/* New Appointment Button */}
<div className="mb-4">
  <button
    onClick={() => setShowCreateModal(true)}
    className="border border-gray-300 rounded-full px-4 py-1 text-gray-700 text-sm flex items-center hover:shadow"
  >
    New Appointment <span className="ml-2 text-xl leading-none">+</span>
  </button>
              </div>

{/* Appointment Grid */}
            <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto h-full">
                <div className="min-w-full inline-block">
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: `80px repeat(${operatories.length}, minmax(130px, 1fr))`,
                      gridTemplateRows: `auto repeat(${timeSlots.length}, 24px)`,
                      width: "fit-content",
                      minWidth: "100%"
                    }}
                  >
        {/* Time Labels */}
                  {timeSlots.map((time, i) => {
  const [hour, minuteWithAmPm] = time.split(":");
  const [minute, ampm] = minuteWithAmPm.split(" ");
  const isTopOfHour = minute === "00";

  const hourLabel = `${hour}${ampm.toLowerCase()}`; // e.g., "7am"
  const minuteLabel = `:${minute}`;                 // e.g., ":10"

  return (
    <div
      key={`time-${i}`}
      className={`px-2 py-1 border-b border-r bg-white z-10 text-xs leading-none
        ${isTopOfHour ? "font-semibold text-gray-800" : "text-gray-400"}`}
      style={{
        gridColumn: 1,
        gridRow: i + 2,
        display: "flex",
        alignItems: "center",
        height: "100%", // ensures full row fill
      }}
    >
      {isTopOfHour ? hourLabel : minuteLabel}
    </div>
  );
})}




        {/* Operatory Headers */}
{operatories.map((op, index) => (
  <div
    key={`header-${op.OperatoryNum}`}
    className="text-center text-sm font-medium p-2 border-b border-l bg-gray-100 sticky top-0 z-20"
    style={{ gridColumn: index + 2, gridRow: 1 }}
  >
    {op.OpName}
  </div>
))}


        {/* Grid Cells (striped) */}
                   {timeSlots.map((_, rowIdx) =>
  operatories.map((_, colIdx) => (
    <div
      key={`cell-${rowIdx}-${colIdx}`}
      className={`border-r ${rowIdx % 2 === 0 ? "border-b" : ""}`}
      style={{
        gridColumn: colIdx + 2,
        gridRow: rowIdx + 2,
        backgroundColor: rowIdx % 2 === 0 ? "#f9f9f9" : "#ffffff",
      }}
    />
  ))
)}

        {/* Appointments */}
{appointments
  .filter(app => {
    const appointmentDate = app.date;
    const selectedDateStr = selectedDate.toISOString().split('T')[0];

    const shouldDisplay = appointmentDate === selectedDateStr;

    console.log("📋 Checking appointment for display:", {
      id: app.id,
      date: appointmentDate,
      selectedDate: selectedDateStr,
      patient: app.patientName,
      willDisplay: shouldDisplay
    });

    return shouldDisplay;
  })
  .map((app) => {
    let rowIndex = 2;
    let span = 1;
    let providerIndex = -1;

try {
  const start = new Date(app.startTimeDate);
  const hour = start.getHours();
  const minute = start.getMinutes();
  const minutesSinceStartOfDay = (hour * 60 + minute) - (7 * 60);
  const rowOffset = 2;
  rowIndex = Math.floor(minutesSinceStartOfDay / 10) + rowOffset;

  span = Math.ceil(app.duration / 10);

  providerIndex = operatories.findIndex(
    (op) => Number(op.OperatoryNum) === Number(app.operatoryId)
  );
  console.log("🧪 Matching operatory:", {
  appointmentOp: app.operatoryId,
  matchedIndex: providerIndex
});
} catch (err) {
  console.error("⛔ Error parsing appointment time:", app, err);
  return null;
}

    if (providerIndex === -1) return null;

           return (
                        <div
                          key={app.id}
                          className="rounded cursor-pointer text-sm p-1 text-black overflow-hidden shadow"
                          style={{
                            gridColumn: providerIndex + 2,
                            gridRow: `${rowIndex} / span ${span}`,
                            backgroundColor: app.color || "#F9E7A0",

                          }}
                          onClick={() => handleAppointmentClick(app)}
                        >
                          <div className="font-medium">{app.patientName}</div>
               <div className="text-xs">{app.type}</div>
               <div
  className="text-[10px] mt-1 px-2 py-0.5 rounded-full text-white inline-block"
  style={{
    backgroundColor: app.statusColor || "#9ca3af",
    width: "fit-content"
  }}
>
  {app.status}
</div>
                        </div>
                      );
                    })}


      </div>
                </div>
              </div>
            </div>
          </div>



          {/* Right Side: Mini Calendar + Details */}
          <div className="w-80 flex-shrink-0 flex flex-col h-full overflow-y-auto">
            {/* Mini Calendar */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-1">
                  <ChevronLeft size={16} />
                </button>
                <h3 className="font-medium">{currentMonthName}</h3>
                <button onClick={handleNextMonth} className="p-1">
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 mb-2">
                {daysOfWeek.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-sm">
                {generateCalendarDays().map((day, index) => {

                  const isSelected =
                    day &&
                    selectedDate.getDate() === day &&
                    selectedDate.getMonth() === currentMonth.getMonth() &&
                    selectedDate.getFullYear() === currentMonth.getFullYear();

                  return (
                    <div
                      key={index}
                      className={`
                      h-8 w-8 flex items-center justify-center rounded-full
                      ${isSelected ? "bg-blue-600 text-white" : ""}
                      ${isToday(day) && !isSelected ? "bg-blue-100 font-bold text-blue-600" : ""}
                      ${day ? "hover:bg-gray-100 cursor-pointer" : ""}
                    `}
                      onClick={() => handleDaySelect(day)}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Appointment Details */}
            {selectedAppointment && (
  <div className="bg-white rounded-lg shadow-md p-4">
    <h3 className="font-medium text-lg mb-4">Appointment Details</h3>
    <div className="space-y-4 text-sm text-gray-700">
      <div>
        <strong>Patient:</strong> {selectedAppointment.patientName}
      </div>
      <div>
  <strong>Date & Time:</strong>{" "}
  {new Date(`${selectedAppointment.date}T00:00:00`).toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
})} at {selectedAppointment.fullStartTime} – {selectedAppointment.endTime}
</div>
      <div>
        <strong>Provider:</strong> {selectedAppointment.staff}
      </div>

      {/* ✅ NEW: Actual Procedures */}
      {selectedAppointment.procedureLogs && selectedAppointment.procedureLogs.length > 0 ? (
  <div>
    <strong>Procedures:</strong>
    <ul className="ml-4 list-disc text-sm mt-1">
      {selectedAppointment.procedureLogs.map((proc) => (
        <li key={proc.ProcNum}>
          {proc.descript || "Unnamed"} ({proc.procCode})
        </li>
      ))}
    </ul>
  </div>
) : selectedAppointment.type ? (
  <div>
    <strong>Procedures:</strong> <span>{selectedAppointment.type}</span>
  </div>
) : (
  <div>
    <strong>Procedures:</strong> <span className="italic text-gray-500">None found</span>
  </div>
)}

      <div>
        <div className="flex items-center gap-2">
  <strong>Status:</strong>
  <span
    className="px-2 py-0.5 rounded-full text-white text-xs"
    style={{
      backgroundColor: selectedAppointment.statusColor || "#9ca3af"
    }}
  >
    {selectedAppointment.status}
  </span>
</div>
                    </div>

      <div>
        <strong>Medical Notes:</strong>
        <textarea
          className="w-full border border-gray-300 rounded-md p-2 text-sm mt-1"
          rows={4}
          placeholder="Message text goes here..."
          value={notes}
          onChange={handleNotesChange}
          onBlur={saveNotes}
        />
      </div>

      {/* Update Appointment Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={() => setShowUpdateModal(true)}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          Update Appointment
        </button>
      </div>
    </div>
  </div>
            )}
          </div>
          </div>

          {/* Modal for creating new appointment */}

           {showCreateModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <h3 className="text-lg font-semibold mb-4">Create New Appointment</h3>

        <form onSubmit={handleCreateAppointment}>

        {/* Patient Search Input with React Select */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Patient</label>
          <ReactSelect
            cacheOptions
            options={patientOptions}
            onInputChange={handleSearchInputChange}
            onChange={handleSearchChange}
            isLoading={loadingPatients}
            placeholder="Search by last name..."
            value={
              newAppointment.patientId
                ? patientOptions.find(option => option.value === newAppointment.patientId)
                : null
            }
                    />
                    <p className="text-xs text-gray-500 mt-1">For best results, search by patient's last name</p>
        </div>



        {/* ✅ Provider Dropdown (fixed) */}
<div className="mb-4">
  <label className="block text-sm font-medium mb-1">Provider</label>
  <select
    className="w-full border rounded p-2"
    value={newAppointment.providerId}
    onChange={(e) =>
      setNewAppointment({ ...newAppointment, providerId: e.target.value })
    }
    required
  >
    <option value="" disabled>Select Provider</option>
    {staffMembers.map((provider) => (
      <option key={provider.id} value={provider.id}>
        {provider.fullName}
      </option>
    ))}
  </select>
</div>

   {/* Date Picker */}
         <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            value={newAppointment.date}
            onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
            required
          />
        </div>

        {/* Time Picker */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Start Time</label>
          <input
            type="time"
            className="w-full border rounded p-2"
            value={newAppointment.startTime}
            onChange={(e) => setNewAppointment({ ...newAppointment, startTime: e.target.value })}
            required
          />
        </div>

        {/* Duration Input */}
         <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Duration (mins)</label>
          <select
            className="w-full border rounded p-2"
            value={newAppointment.duration}
            onChange={(e) => setNewAppointment({ ...newAppointment, duration: e.target.value })}
            required
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
          </select>
                  </div>

                  {/* Procedure Input */}
                  <div className="mb-4">
  <label className="block text-sm font-medium mb-1">
    Procedure <span className="text-red-500">*</span>
  </label>
  <select
    className="w-full border rounded p-2"
    value={newAppointment.procedure || ""}
    onChange={(e) => setNewAppointment({ ...newAppointment, procedure: e.target.value, description: e.target.value })}
    required
  >
    <option value="" disabled>Select Procedure</option>
    {procedureOptions.map((procedure) => (
      <option key={procedure.value} value={procedure.value}>
        {procedure.label}
      </option>
    ))}
  </select>
</div>

                  {/* Notes Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                      className="w-full border rounded p-2"
                      rows={3}
                      placeholder="Enter any additional notes here..."
                      value={newAppointment.notes || ""}
                      onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                    />
                  </div>

                  {/* Form Buttons*/}

        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            className="text-sm text-gray-600 hover:underline"
            onClick={() => setShowCreateModal(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                      disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  </div>
          )}
          {/* Modal for updating appointment */}
{showUpdateModal && selectedAppointment && (
  <UpdateAppointmentModal
    isOpen={showUpdateModal}
    onClose={() => setShowUpdateModal(false)}
    appointment={selectedAppointment}
    staffMembers={staffMembers}
    procedureOptions={procedureOptions}
    onUpdate={handleUpdateAppointment}
    isLoading={isLoading}
  />
)}
      </div>
    </div>
  );
};


export default Appointments;
