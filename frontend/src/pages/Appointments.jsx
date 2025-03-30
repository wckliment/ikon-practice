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

  console.log("✅ Staff Members:", staffMembers);


  return (
    <div className="h-screen" style={{ backgroundColor: "#EBEAE6" }}>
      {/* Main App Sidebar - Fixed position */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-20" style={{ backgroundColor: "#EBEAE6" }}>
        {/* Top Bar */}
        <TopBar />

        {/* Custom Header for Appointments - Adjusted position */}
        <div className="px-4 pt-0 pb-2 ml-16">
          <h1 className="text-4xl font-bold text-gray-800">
            Appointments
          </h1>
        </div>

        {/* Main content with flex layout - fixed to eliminate white space */}
        <div className="p-6 mt-6 ml-10 flex">
          {/* Left side - Appointments content with proper sizing */}
          <div className="flex-1 mr-6" style={{ minWidth: 0 }}>
            {/* Filter Controls */}
            <div className="flex space-x-4 mb-6">
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-md pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-48"
                  onChange={(e) => {
                    // Handle date range selection
                    const today = new Date();
                    switch(e.target.value) {
                      case "today":
                        setSelectedDate(today);
                        break;
                      case "tomorrow":
                        const tomorrow = new Date(today);
                        tomorrow.setDate(today.getDate() + 1);
                        setSelectedDate(tomorrow);
                        break;
                      case "this_week":
                        // Keep current date but ensure we're viewing this week
                        break;
                      case "next_week":
                        const nextWeek = new Date(today);
                        nextWeek.setDate(today.getDate() + 7);
                        setSelectedDate(nextWeek);
                        break;
                    }
                  }}
                >
                  <option value="">Select Date Range</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="this_week">This Week</option>
                  <option value="next_week">Next Week</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>

              <div className="relative">
                <select className="appearance-none bg-white border border-gray-300 rounded-md pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-48">
                  <option value="">Select Office Location</option>
                  <option value="main">Main Office</option>
                  <option value="north">North Branch</option>
                  <option value="south">South Branch</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>

              <div className="relative">
                <select className="appearance-none bg-white border border-gray-300 rounded-md pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-48">
                  <option value="">Filter by Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>

              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center"
                onClick={createNewAppointment}
              >
                <span className="mr-1">+</span>
                New Appointment
              </button>
            </div>

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* Appointment Grid - with horizontal scrolling for additional staff */}
            {!isLoading && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto" style={{ width: "100%" }}>
                  <table style={{ width: "max-content", minWidth: "100%", tableLayout: "fixed" }}>
                    {/* Header row with staff names */}
                    <thead>
                      <tr>
                        <th style={{ width: "80px" }} className="p-3 border text-left sticky left-0 bg-white z-10"></th>
                        {staffMembers.map((staff, index) => (
                          <th key={staff.id} style={{ width: "130px" }} className="p-3 text-center border text-sm font-medium">
                            {staff.fullName}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    {/* Time slots */}
                    <tbody>
                      {timeSlots.map((time, index) => (
                        <tr key={time} className="border-b">
                          {/* Time label - sticky left column */}
                          <td
  className={`p-3 border-r text-xs text-gray-500 sticky left-0 bg-white z-10 ${
    time.endsWith(":00 AM") || time.endsWith(":00 PM") ? "font-semibold" : ""
  }`}
>
  {time}
</td>

                          {/* Staff columns */}
                          {staffMembers.map(staff => {
                            const appsForThisSlot = getAppointmentsForTimeAndStaff(time, staff);

                            return (
                              <td key={`${staff.id}-${time}`} className="border-r p-1 relative">
                                {appsForThisSlot.map(app => {
  console.log(`🧱 Rendering ${app.patientName} | Duration: ${app.duration} | Height: ${app.height}px`);

  return (
    <div
  key={app.id}
  className="absolute inset-x-1 top-0 rounded cursor-pointer"
  style={{
    height: `${app.height}px`,
    backgroundColor: app.type === "Initial Consult" ? "#F9C3C3" : "#F9E7A0",
    boxSizing: "border-box",
    overflow: "hidden"  // optional but helps if there's any overflow issue
  }}
  onClick={() => handleAppointmentClick(app)}
>
      <div className="text-sm font-medium">{app.patientName}</div>
      <div className="text-xs">{app.type}</div>
    </div>
  );
})}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right side with specific sizing */}
          <div className="w-80">
            {/* Calendar widget */}
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

              {/* Days of week */}
              <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 mb-2">
                {daysOfWeek.map(day => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1 text-sm">
                {generateCalendarDays().map((day, index) => {
                  // Check if this day has appointments
                  const hasAppointments = day && appointments.some(app => {
                    const appDate = new Date(app.date);
                    return appDate.getDate() === day &&
                           appDate.getMonth() === currentMonth.getMonth() &&
                           appDate.getFullYear() === currentMonth.getFullYear();
                  });

                  // Check if this is the selected day
                  const isSelected = day &&
                    selectedDate.getDate() === day &&
                    selectedDate.getMonth() === currentMonth.getMonth() &&
                    selectedDate.getFullYear() === currentMonth.getFullYear();

                  return (
                    <div
                      key={index}
                      className={`
                        h-8 w-8 flex items-center justify-center rounded-full
                        ${isSelected ? 'bg-blue-600 text-white' : ''}
                        ${isToday(day) && !isSelected ? 'bg-blue-100 font-bold text-blue-600' : ''}
                        ${!isSelected && !isToday(day) && hasAppointments ? 'bg-blue-100' : ''}
                        ${day ? 'hover:bg-gray-100 cursor-pointer' : ''}
                      `}
                      onClick={() => handleDaySelect(day)}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Appointment details */}
            {selectedAppointment && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-medium text-lg mb-4">Appointment Details</h3>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <User size={16} className="mt-1 mr-2 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">Patient:</div>
                      <div>{selectedAppointment.patientName}</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar size={16} className="mt-1 mr-2 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">Date & Time:</div>
                      <div>
                        {new Date(selectedAppointment.date).toLocaleDateString('en-US', {
                          month: 'numeric',
                          day: 'numeric',
                          year: 'numeric'
                        })} at {selectedAppointment.fullStartTime} to {selectedAppointment.endTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <User size={16} className="mt-1 mr-2 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">Provider:</div>
                      <div>{selectedAppointment.staff}</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar size={16} className="mt-1 mr-2 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">Procedure Type:</div>
                      <div>{selectedAppointment.type}</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Filter size={16} className="mt-1 mr-2 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">Status:</div>
                      <div>{selectedAppointment.status}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">Medical Notes:</div>
                    <textarea
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                      placeholder="Message text goes here..."
                      rows={4}
                      value={notes}
                      onChange={handleNotesChange}
                      onBlur={saveNotes}
                    ></textarea>
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
