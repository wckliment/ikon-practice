import React, { useState, useEffect } from "react";
import { Calendar, Clock, User, Filter, ChevronLeft, ChevronRight } from "react-feather";
import { useSelector, useDispatch } from "react-redux";
import { fetchProviders } from "../redux/providersSlice";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

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

  const { list: providers, loading: providersLoading } = useSelector((state) => state.providers);

  console.log("🧠 Redux - Providers state:", providers);

  useEffect(() => {
    console.log("📣 dispatching fetchProviders()");
    dispatch(fetchProviders());
  }, [dispatch]);

  const staffMembers = providers.map((prov) => ({
    id: prov.ProvNum,
    name: prov.Abbr,
    fullName: `${prov.FName} ${prov.LName}`.trim(),
    color: `rgb(${prov.provColor})`,
  }));

  useEffect(() => {
    const options = { month: "long", year: "numeric" };
    setCurrentMonthName(currentMonth.toLocaleDateString("en-US", options));
  }, [currentMonth]);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, currentMonth]);

  const transformAppointmentData = async (apiAppointments) => {
    const transformed = [];

    for (const apt of apiAppointments) {
      console.log("🔎 Raw apt object:", apt);
      console.log("📋 Appointment PatNum:", apt.patientId);

      const startTimeRaw = apt.startTime || apt.AptDateTime;
      const normalizedDateTime = startTimeRaw?.replace(" ", "T");
      const startTime = new Date(normalizedDateTime);
      const durationInMinutes = apt.pattern?.length ? apt.pattern.length * 5 : 60;
      const endTime = new Date(startTime.getTime() + durationInMinutes * 60000);
      const pixelsPerMinute = 3.2;
      const height = durationInMinutes * pixelsPerMinute;


      let patientName = `Patient #${apt.patientId}`;
      try {
        if (apt.patientId) {
          const patient = await appointmentService.getPatientById(apt.patientId);
          if (patient && (patient.FName || patient.LName)) {
            console.log("🧑‍⚕️ Patient fetched:", patient);
            patientName = `${patient.FName || ""} ${patient.LName || ""}`.trim();
          } else {
            console.warn("⚠️ No patient data returned for PatNum:", apt.patientId);
          }
        }
      } catch (err) {
        console.warn(`⚠️ Failed to fetch patient ${apt.patientId}:`, err);
      }

      console.log(
        `🧪 ${patientName}: Pattern=${apt.pattern}, Duration=${durationInMinutes} mins, Height=${height}px`
      );

      transformed.push({
        id: apt.id || apt.AptNum,
        patientName,
        date: startTime.toISOString().split("T")[0],
        startTime: startTime.toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
        fullStartTime: startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
        endTime: endTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
        duration: durationInMinutes,
        height: height,
        type: apt.procedureDescription || apt.ProcDescript || "Appointment",
        notes: apt.notes || apt.Note || "",
        status: apt.status || apt.confirmed || apt.Confirmed || "Unknown",
        staff: apt.providerName || apt.provAbbr || `Provider #${apt.providerId || apt.ProvNum}`,
        providerId: apt.providerId || apt.ProvNum,
        color: `rgb(${apt.provColor || "249,231,160"})`,
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
      console.log("🛰 Raw appointment response:", appointmentsData);

      //  Await transformed appointments (because it now fetches patient data)
      const transformedAppointments = await transformAppointmentData(appointmentsData);
      console.log("📦 Transformed Appointments:", transformedAppointments);

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
    for (let minute = 0; minute < 60; minute += 15) {
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

  const createNewAppointment = () => {
    console.log("Create New Appointment clicked");
    // TODO: implement modal or navigation
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
      // This should ideally be a PATCH or PUT request to your backend
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

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.notes || "");
  };

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
              {/* Filters go here - no changes needed */}
              {/* ... Date, Office, Status, Button ... */}
            </div>

            {/* Appointment Grid */}
            <div className="flex-1 bg-white rounded-lg shadow-md overflow-auto">
              <div className="grid w-full">
                <div
                  className="grid w-full"
                  style={{
                    gridTemplateColumns: `80px repeat(${staffMembers.length}, 130px)`,
                    gridTemplateRows: `auto repeat(${timeSlots.length}, 48px)`,
                  }}
                >
                  {/* Time Labels */}
                  {timeSlots.map((time, i) => (
                    <div
                      key={`time-${i}`}
                      className="text-xs text-gray-500 p-2 border-b border-r bg-white z-10"
                      style={{ gridColumn: 1, gridRow: i + 2 }}
                    >
                      {time}
                    </div>
                  ))}

                  {/* Staff Headers */}
                  {staffMembers.map((staff, index) => (
                    <div
                      key={`header-${staff.id}`}
                      className="text-center text-sm font-medium p-2 border-b border-l bg-gray-100 sticky top-0 z-20"
                      style={{ gridColumn: index + 2, gridRow: 1 }}
                    >
                      {staff.fullName}
                    </div>
                  ))}

                  {/* Grid Cells (striped) */}
                  {timeSlots.map((_, rowIdx) =>
                    staffMembers.map((_, colIdx) => (
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
                  {appointments.map((app) => {
                    let rowIndex = 2;
                    let span = 1;
                    let providerIndex = -1;

                    try {
                      const [hourStr, minuteStrPart] = app.fullStartTime.split(":");
                      const [minuteStr, ampm] = minuteStrPart.split(" ");
                      let hour = parseInt(hourStr, 10);
                      const minute = parseInt(minuteStr, 10);

                      if (ampm === "PM" && hour !== 12) hour += 12;
                      if (ampm === "AM" && hour === 12) hour = 0;

                      const totalMinutes = (hour - 7) * 60 + minute;
                      rowIndex = Math.floor(totalMinutes / 15) + 2;
                      span = Math.ceil(app.duration / 15);
                      providerIndex = staffMembers.findIndex((s) => s.name === app.staff);
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
                          backgroundColor:
                            app.type === "Initial Consult" ? "#F9C3C3" : "#F9E7A0",
                        }}
                        onClick={() => handleAppointmentClick(app)}
                      >
                        <div className="font-medium">{app.patientName}</div>
                        <div className="text-xs">{app.type}</div>
                      </div>
                    );
                  })}
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
                  const hasAppointments =
                    day &&
                    appointments.some((app) => {
                      const appDate = new Date(app.date);
                      return (
                        appDate.getDate() === day &&
                        appDate.getMonth() === currentMonth.getMonth() &&
                        appDate.getFullYear() === currentMonth.getFullYear()
                      );
                    });

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
                      ${!isSelected && !isToday(day) && hasAppointments ? "bg-blue-100" : ""}
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
                    {new Date(selectedAppointment.date).toLocaleDateString("en-US")} at{" "}
                    {selectedAppointment.fullStartTime} – {selectedAppointment.endTime}
                  </div>
                  <div>
                    <strong>Provider:</strong> {selectedAppointment.staff}
                  </div>
                  <div>
                    <strong>Procedure:</strong> {selectedAppointment.type}
                  </div>
                  <div>
                    <strong>Status:</strong> {selectedAppointment.status}
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default Appointments;
