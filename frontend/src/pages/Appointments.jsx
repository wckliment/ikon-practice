import React, { useState, useEffect } from "react";
import { Calendar, Clock, User, Filter, ChevronLeft, ChevronRight } from "react-feather";
import { useSelector } from "react-redux";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

// API service for appointments
const appointmentService = {
  // Get appointments for a date range
  async getAppointments(startDate, endDate, providerId = null) {
    try {
      // Format dates for API
      const formattedStart = startDate.toISOString().split('T')[0];
      const formattedEnd = endDate.toISOString().split('T')[0];

      // Build query params
      let url = `/api/appointments?startDate=${formattedStart}&endDate=${formattedEnd}`;
      if (providerId) {
        url += `&providerId=${providerId}`;
      }

      console.log(`🔍 ATTEMPTING API CALL: Fetching appointments from ${url}`);

      // Add request headers to logs
      console.log("🔍 Request Headers:", {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + (localStorage.getItem('token') || 'no-token')
      });

      // Make the API call with explicit timeout for debugging
      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout for debugging
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + (localStorage.getItem('token') || 'no-token')
        }
      });

      console.log(`✅ API CALL SUCCESS: Status ${response.status}`);
      console.log("📦 Response Headers:", response.headers);

      // Log the first part of the response data to avoid excessive logging
      if (response.data) {
        if (Array.isArray(response.data)) {
          console.log(`📋 Response Data: Array with ${response.data.length} items`);
          if (response.data.length > 0) {
            console.log("📋 First item:", response.data[0]);
          }
        } else if (response.data.data && Array.isArray(response.data.data)) {
          console.log(`📋 Response Data: Object with data array containing ${response.data.data.length} items`);
          if (response.data.data.length > 0) {
            console.log("📋 First item:", response.data.data[0]);
          }
        } else {
          console.log("📋 Response Data (truncated):",
            JSON.stringify(response.data).substring(0, 500) +
            (JSON.stringify(response.data).length > 500 ? "..." : "")
          );
        }
      } else {
        console.log("📋 No response data");
      }

      // Handle different response structures
      // Some APIs return { success: true, data: [...] }
      // Others might return the array directly
      const appointmentsData = response.data.data || response.data;
      return appointmentsData;
    } catch (error) {
      console.error("❌ API CALL FAILED:", error);

      // Log detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("❌ Error Response Data:", error.response.data);
        console.error("❌ Error Response Status:", error.response.status);
        console.error("❌ Error Response Headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("❌ No response received - Network Error:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("❌ Request Setup Error:", error.message);
      }

      throw error;
    }
  },

  // Other methods remain the same
  // ...
};

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentMonthName, setCurrentMonthName] = useState("");
  const [notes, setNotes] = useState("");

  // Staff members - could be fetched from API later
  const staffMembers = [
    { id: 1, name: "Roger Hall" },
    { id: 2, name: "April Moody" },
    { id: 3, name: "Allen Rogers" },
    { id: 4, name: "Shelby Lang" },
    { id: 5, name: "Dr. Yu" },
    { id: 6, name: "Eric Smith" },
    { id: 7, name: "Tommy Strong" },
    { id: 8, name: "Lisa Johnson" },
    { id: 9, name: "Maria Garcia" },
    { id: 10, name: "James Wilson" },
    { id: 11, name: "Dr. Chen" },
    { id: 12, name: "Robert Taylor" },
    { id: 13, name: "Sarah Miller" },
    { id: 14, name: "David Brown" }
  ];

  // Update current month name whenever the month changes
  useEffect(() => {
    const options = { month: 'long', year: 'numeric' };
    setCurrentMonthName(currentMonth.toLocaleDateString('en-US', options));
  }, [currentMonth]);

  // Fetch appointments when selected date or month changes
  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, currentMonth]);

  // Convert API appointment data to the format our UI expects
  const transformAppointmentData = (apiAppointments) => {
    return apiAppointments.map(apt => {
      // Parse dates from API
      const startTime = new Date(apt.startTime);
      const endTime = new Date(apt.endTime);

      // Format times for display
      const formattedStartTime = startTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const formattedEndTime = endTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      // Simplify to just hour for our grid view
      const hourOnly = startTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true
      });

      return {
        id: apt.id,
        patientName: apt.patientName,
        date: startTime.toISOString().split('T')[0],
        startTime: hourOnly, // For grid matching
        endTime: formattedEndTime,
        fullStartTime: formattedStartTime, // Full time with minutes for details
        duration: Math.round((endTime - startTime) / (1000 * 60)), // Duration in minutes
        type: "Appointment", // Default type
        notes: apt.notes || "",
        status: apt.status,
        staff: apt.providerName, // Map provider to staff
        providerId: apt.providerId,
        color: "#F9E7A0", // Default color
        // Add custom extension data if available
        ...(apt.customTags && { customTags: apt.customTags }),
        ...(apt.internalNotes && { internalNotes: apt.internalNotes }),
        ...(apt.followupRequired && { followupRequired: apt.followupRequired }),
        ...(apt.followupDate && { followupDate: apt.followupDate })
      };
    });
  };

  // Fetch appointments data from API
  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      console.log("Starting fetchAppointments");

      // Calculate date range (start of month to end of month)
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      console.log("Fetching appointments for range:", {
        startOfMonth: startOfMonth.toISOString(),
        endOfMonth: endOfMonth.toISOString(),
        currentMonth: currentMonth.toISOString()
      });

      // For debugging - let's add a test appointment directly
      const debugAppointment = {
        AptNum: 2,
        PatNum: 5,
        AptStatus: "Scheduled",
        Pattern: "//XX//",
        Confirmed: 22,
        confirmed: "Arrived",
        Op: 2,
        Note: "Test appointment",
        ProvNum: 3,
        provAbbr: "HYGAH",
        AptDateTime: "2025-03-25 13:00:00",
        IsNewPatient: "true"
      };

      // Attempt to call API
      let appointmentsData = [];
      try {
        // Call API
        const apiResponse = await appointmentService.getAppointments(startOfMonth, endOfMonth);
        console.log("API Response received:", apiResponse);
        appointmentsData = apiResponse;
      } catch (apiError) {
        console.error("API call failed:", apiError);
        console.log("Using debug appointment for testing");
        // Use debug appointment for testing
        appointmentsData = [debugAppointment];
      }

      console.log("Raw appointments data:", appointmentsData);

      // Transform data for our UI
      const transformedAppointments = transformAppointmentData(appointmentsData);
      console.log("Transformed appointments:", transformedAppointments);

      setAppointments(transformedAppointments);

      // Set first appointment as selected if available and none is selected
      if (transformedAppointments.length > 0 && !selectedAppointment) {
        console.log("Setting selected appointment:", transformedAppointments[0]);
        setSelectedAppointment(transformedAppointments[0]);
        setNotes(transformedAppointments[0].notes || "");
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error in fetchAppointments:", error);
      setIsLoading(false);

      // For development: fallback to mock data if API fails
      // Remove this in production
      const mockAppointments = [
        {
          id: 1,
          patientName: "Jason Smith",
          date: "2025-03-20",
          startTime: "9 AM",
          fullStartTime: "9:00 AM",
          endTime: "10:00 AM",
          duration: 60,
          type: "Follow-up",
          notes: "",
          status: "Confirmed",
          staff: "Roger Hall",
          color: "#F9E7A0" // Yellow
        },
        {
          id: 2,
          patientName: "Kathy Peters",
          date: "2025-03-20",
          startTime: "9 AM",
          fullStartTime: "9:00 AM",
          endTime: "10:00 AM",
          duration: 60,
          type: "Treatment",
          notes: "",
          status: "Confirmed",
          staff: "April Moody",
          color: "#F9E7A0" // Yellow
        },
        {
          id: 3,
          patientName: "Jordan Reed",
          date: "2025-03-20",
          startTime: "11 AM",
          fullStartTime: "11:00 AM",
          endTime: "12:00 PM",
          duration: 60,
          type: "Initial Consult",
          notes: "",
          status: "Confirmed",
          staff: "Shelby Lang",
          color: "#F9C3C3" // Pink
        },
        // Add a mock appointment for March 25th to test calendar highlighting
        {
          id: 4,
          patientName: "Test Patient",
          date: "2025-03-25",
          startTime: "1 PM",
          fullStartTime: "1:00 PM",
          endTime: "2:00 PM",
          duration: 60,
          type: "Initial Consult",
          notes: "Test appointment",
          status: "Confirmed",
          staff: "Dr. Yu",
          color: "#F9C3C3" // Pink
        }
      ];

      console.log("Using mock appointments:", mockAppointments);
      setAppointments(mockAppointments);
      if (!selectedAppointment && mockAppointments.length > 0) {
        setSelectedAppointment(mockAppointments[0]);
        setNotes(mockAppointments[0].notes || "");
      }
    }
  };

  // Handle appointment click - fetch full details
  const handleAppointmentClick = async (appointment) => {
    try {
      // Get full appointment details from API
      const detailedAppointment = await appointmentService.getAppointment(appointment.id);

      // Transform to UI format
      const transformedAppointment = transformAppointmentData([detailedAppointment])[0];

      setSelectedAppointment(transformedAppointment);
      setNotes(transformedAppointment.notes || "");
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      // Fallback to the basic appointment data we already have
      setSelectedAppointment(appointment);
      setNotes(appointment.notes || "");
    }
  };

  // Handle notes change and save
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  // Save notes to appointment
  const saveNotes = async () => {
    if (!selectedAppointment) return;

    try {
      // Update appointment extension with new notes
      await appointmentService.updateAppointmentExtension(
        selectedAppointment.id,
        { internalNotes: notes }
      );

      // Update local state
      setSelectedAppointment({
        ...selectedAppointment,
        notes: notes
      });

      // Refresh appointments list to show updated data
      fetchAppointments();

      // Show a success toast/notification here if you have a notification system
    } catch (error) {
      console.error("Error saving notes:", error);
      // Could add error notification here
    }
  };

  // Function to create a new appointment (stub for now)
  const createNewAppointment = () => {
    // This would open a modal or navigate to a new appointment form
    console.log("Create new appointment clicked");
    // You could implement this later with:
    // navigate('/appointments/new') or setShowNewAppointmentModal(true)
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Generate calendar data for the month view
  const generateCalendarDays = () => {
    const days = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }

    return days;
  };

  // Get today's date to highlight on calendar
  const today = new Date();
  const isToday = (day) => {
    return day === today.getDate() &&
           currentMonth.getMonth() === today.getMonth() &&
           currentMonth.getFullYear() === today.getFullYear();
  };

  // Generate time slots for the day view
  const timeSlots = [
    "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM",
    "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM"
  ];

  // Get appointments for a specific time slot and staff member
  const getAppointmentsForTimeAndStaff = (time, staff) => {
    console.log("Checking appointments for time/staff:", time, staff.name);
    console.log("Available appointments:", appointments.length);

    const matchingApps = appointments.filter(app => {
      const timeMatches = app.startTime === time;
      const staffMatches = app.staff === staff.name;

      // For debugging
      if (timeMatches && !staffMatches) {
        console.log(`Time matches but staff doesn't: ${app.staff} != ${staff.name}`);
      }

      return timeMatches && staffMatches;
    });

    // Always log the result for debugging
    if (matchingApps.length > 0) {
      console.log(`Found ${matchingApps.length} appointments for ${staff.name} at ${time}:`, matchingApps);
    }

    return matchingApps;
  };

  // Days of the week for calendar
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Handle day selection from calendar
  const handleDaySelect = (day) => {
    if (!day) return; // Skip empty days

    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
  };

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
                            {staff.name}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    {/* Time slots */}
                    <tbody>
                      {timeSlots.map((time, index) => (
                        <tr key={time} className="border-b">
                          {/* Time label - sticky left column */}
                          <td className="p-3 border-r text-xs text-gray-500 sticky left-0 bg-white z-10">
                            {time}
                          </td>

                          {/* Staff columns */}
                          {staffMembers.map(staff => {
                            const appsForThisSlot = getAppointmentsForTimeAndStaff(time, staff);

                            return (
                              <td key={`${staff.id}-${time}`} className="border-r p-1 relative h-16">
                                {appsForThisSlot.map(app => (
                                  <div
                                    key={app.id}
                                    className="absolute inset-x-1 top-1 bottom-1 rounded p-1 cursor-pointer"
                                    style={{
                                      backgroundColor: app.type === "Initial Consult" ? "#F9C3C3" : "#F9E7A0"
                                    }}
                                    onClick={() => handleAppointmentClick(app)}
                                  >
                                    <div className="text-sm font-medium">{app.patientName}</div>
                                    <div className="text-xs">{app.type}</div>
                                  </div>
                                ))}
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
