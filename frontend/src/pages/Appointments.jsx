import React, { useState, useEffect } from "react";
import { Calendar, Clock, User, Filter, ChevronLeft, ChevronRight } from "react-feather";
import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentMonthName, setCurrentMonthName] = useState("March 2025");

  // Extended staff members list to test horizontal scrolling
  const staffMembers = [
    { id: 1, name: "Roger Hall" },
    { id: 2, name: "April Moody" },
    { id: 3, name: "Allen Rogers" },
    { id: 4, name: "Shelby Lang" },
    { id: 5, name: "Dr. Yu" },
    { id: 6, name: "Eric Smith" },
    { id: 7, name: "Tommy Strong" },
    { id: 8, name: "Lisa Johnson" },
    // Additional test staff members
    { id: 9, name: "Maria Garcia" },
    { id: 10, name: "James Wilson" },
    { id: 11, name: "Dr. Chen" },
    { id: 12, name: "Robert Taylor" },
    { id: 13, name: "Sarah Miller" },
    { id: 14, name: "David Brown" }
  ];

  useEffect(() => {
    // Simulate fetching appointments data
    // Replace with your actual API call
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        // Mock data - replace with actual API call
        const mockAppointments = [
          {
            id: 1,
            patientName: "Jason Smith",
            date: "2025-03-20",
            startTime: "9 AM",
            endTime: "10 AM",
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
            endTime: "10 AM",
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
            endTime: "12 PM",
            duration: 60,
            type: "Initial Consult",
            notes: "",
            status: "Confirmed",
            staff: "Shelby Lang",
            color: "#F9C3C3" // Pink
          }
        ];

        setTimeout(() => {
          setAppointments(mockAppointments);
          setSelectedAppointment(mockAppointments[2]); // Set Jordan Reed as selected by default
          setIsLoading(false);
        }, 500); // Simulate network delay
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

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

  // Handle appointment click
  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
  };

  // Generate time slots for the day view (limited to match the design)
  const timeSlots = [
    "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM",
    "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM"
  ];


  // Get appointments for a specific time slot and staff member
  const getAppointmentsForTimeAndStaff = (time, staff) => {
    return appointments.filter(app =>
      app.startTime === time && app.staff === staff.name
    );
  };

  // Days of the week for calendar
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

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
          <div className="flex-1 mr-6" style={{ minWidth: 0 }}>  {/* minWidth: 0 helps flex items properly */}
            {/* Filter Controls */}
            <div className="flex space-x-4 mb-6">
              <div className="relative">
                <select className="appearance-none bg-white border border-gray-300 rounded-md pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-48">
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

              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center">
                <span className="mr-1">+</span>
                New Appointment
              </button>
            </div>

            {/* Appointment Grid - with horizontal scrolling for additional staff */}
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
                {generateCalendarDays().map((day, index) => (
                  <div
                    key={index}
                    className={`
                      h-8 w-8 flex items-center justify-center rounded-full
                      ${day === 20 ? 'bg-blue-600 text-white' : day ? 'hover:bg-gray-100 cursor-pointer' : ''}
                    `}
                  >
                    {day}
                  </div>
                ))}
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
                      <div>1/3/2025 at 11:00 AM to 12:00 PM</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <User size={16} className="mt-1 mr-2 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">Provider:</div>
                      <div>Shelby Lang</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar size={16} className="mt-1 mr-2 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">Procedure Type:</div>
                      <div>Initial Consult</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Filter size={16} className="mt-1 mr-2 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">Status:</div>
                      <div>Confirmed</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock size={16} className="mt-1 mr-2 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">Payment Info:</div>
                      <div>Yes</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">Medical Notes:</div>
                    <textarea
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                      placeholder="Message text goes here..."
                      rows={4}
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
