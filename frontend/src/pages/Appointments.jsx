import React, { useState, useEffect } from "react";
import { Calendar, Clock, User, Plus, Filter, ChevronLeft, ChevronRight } from "react-feather";
import Header from "../components/Header";
import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Sample staff members
  const staffMembers = [
    { id: 1, name: "Roger Hall" },
    { id: 2, name: "April Moody" },
    { id: 3, name: "Allen Rogers" },
    { id: 4, name: "Shelby Lang" },
    { id: 5, name: "Dr. Yu" },
    { id: 6, name: "Eric Smith" },
    { id: 7, name: "Tommy Strong" }
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
            date: "2025-01-04",
            startTime: "09:00 AM",
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
            patientName: "Jordan Reed",
            date: "2025-01-04",
            startTime: "11:00 AM",
            endTime: "12:00 PM",
            duration: 60,
            type: "Initial Consult",
            notes: "",
            status: "Confirmed",
            staff: "Shelby Lang",
            color: "#F9C3C3" // Pink
          },
          {
            id: 3,
            patientName: "Alan Williams",
            date: "2025-01-04",
            startTime: "02:00 PM",
            endTime: "03:00 PM",
            duration: 60,
            type: "Routine Checkup",
            notes: "",
            status: "Confirmed",
            staff: "Dr. Yu",
            color: "#C3F9D3" // Green
          },
          {
            id: 4,
            patientName: "Kathy Peters",
            date: "2025-01-04",
            startTime: "09:30 AM",
            endTime: "10:30 AM",
            duration: 60,
            type: "Treatment",
            notes: "",
            status: "Confirmed",
            staff: "April Moody",
            color: "#F9E7A0" // Yellow
          },
          {
            id: 5,
            patientName: "Matt Somers",
            date: "2025-01-04",
            startTime: "02:30 PM",
            endTime: "03:30 PM",
            duration: 60,
            type: "Follow-up",
            notes: "",
            status: "Confirmed",
            staff: "Shelby Lang",
            color: "#F9C3C3" // Pink
          }
        ];

        setTimeout(() => {
          setAppointments(mockAppointments);
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

  // Generate days for the calendar
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 for Sunday, 1 for Monday, etc.

    const calendarDays = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      calendarDays.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(new Date(year, month, day));
    }

    return calendarDays;
  };

  // Format time for display
  const formatAppointmentTime = (startTime, endTime) => {
    return `${startTime} to ${endTime}`;
  };

  // Format month and year for display
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Get appointment by staff and time
  const getAppointmentByStaffAndTime = (staff, hour) => {
    return appointments.filter(
      app => app.staff === staff.name &&
             parseInt(app.startTime.split(':')[0]) === hour
    );
  };

  // Handle appointment click
  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
  };

  // Generate time slots
  const timeSlots = [];
  for (let hour = 8; hour <= 17; hour++) {
    timeSlots.push(hour);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <TopBar />

      <div className="ml-32 mr-4 mt-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Appointments</h1>
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button className="p-2 rounded-full bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex mb-4">
          <div className="flex-1 pr-4">
            <div className="flex space-x-4 mb-4">
              <div className="relative">
                <select className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Select Date Range</option>
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>

              <div className="relative">
                <select className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Select Office Location</option>
                  <option>Main Office</option>
                  <option>North Branch</option>
                  <option>South Branch</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>

              <div className="relative">
                <select className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Filter by Status</option>
                  <option>Confirmed</option>
                  <option>Pending</option>
                  <option>Cancelled</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>

              <button className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-md">
                <Plus size={16} />
                <span>New Appointment</span>
              </button>
            </div>

            {/* Appointment Grid */}
            <div className="bg-white rounded-lg shadow">
              {/* Staff header */}
              <div className="grid grid-cols-8 border-b">
                <div className="py-3 px-4 font-medium text-gray-600 border-r"></div>
                {staffMembers.map(staff => (
                  <div key={staff.id} className="py-3 px-4 font-medium text-gray-600 text-center border-r">
                    {staff.name}
                  </div>
                ))}
              </div>

              {/* Time slots */}
              {timeSlots.map(hour => (
                <div key={hour} className="grid grid-cols-8 border-b">
                  <div className="py-6 px-4 text-xs text-gray-500 border-r">
                    {hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour-12} PM`}
                  </div>

                  {staffMembers.map(staff => {
                    const appointmentsForThisSlot = getAppointmentByStaffAndTime(staff, hour);

                    return (
                      <div key={`${staff.id}-${hour}`} className="py-2 px-2 border-r relative min-h-[70px]">
                        {appointmentsForThisSlot.map(appointment => (
                          <div
                            key={appointment.id}
                            className="absolute inset-x-1 p-2 rounded-md cursor-pointer"
                            style={{ backgroundColor: appointment.color }}
                            onClick={() => handleAppointmentClick(appointment)}
                          >
                            <div className="font-medium text-sm">{appointment.patientName}</div>
                            <div className="text-xs">{appointment.type}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar with calendar and appointment details */}
          <div className="w-80">
            {/* Monthly calendar */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-1">
                  <ChevronLeft size={20} />
                </button>
                <h3 className="font-medium">{formatMonthYear(currentMonth)}</h3>
                <button onClick={handleNextMonth} className="p-1">
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Calendar days of week */}
              <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600 mb-2">
                <div>SUN</div>
                <div>MON</div>
                <div>TUE</div>
                <div>WED</div>
                <div>THU</div>
                <div>FRI</div>
                <div>SAT</div>
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((day, index) => (
                  <div
                    key={index}
                    className={`
                      h-8 w-8 flex items-center justify-center text-sm rounded-full
                      ${day && day.getDate() === selectedDate.getDate() &&
                         day.getMonth() === selectedDate.getMonth() &&
                         day.getFullYear() === selectedDate.getFullYear()
                          ? 'bg-blue-600 text-white'
                          : day ? 'hover:bg-gray-100 cursor-pointer' : ''}
                    `}
                    onClick={() => day && setSelectedDate(day)}
                  >
                    {day ? day.getDate() : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Appointment details */}
            {selectedAppointment ? (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-medium text-lg mb-4">Appointment Details</h3>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <User size={16} className="mt-1 mr-2 text-gray-500" />
                    <div>
                      <div className="font-medium">Patient:</div>
                      <div>{selectedAppointment.patientName}</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar size={16} className="mt-1 mr-2 text-gray-500" />
                    <div>
                      <div className="font-medium">Date & Time:</div>
                      <div>{new Date(selectedAppointment.date).toLocaleDateString()} at {formatAppointmentTime(selectedAppointment.startTime, selectedAppointment.endTime)}</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <User size={16} className="mt-1 mr-2 text-gray-500" />
                    <div>
                      <div className="font-medium">Provider:</div>
                      <div>{selectedAppointment.staff}</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar size={16} className="mt-1 mr-2 text-gray-500" />
                    <div>
                      <div className="font-medium">Procedure Type:</div>
                      <div>{selectedAppointment.type}</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Filter size={16} className="mt-1 mr-2 text-gray-500" />
                    <div>
                      <div className="font-medium">Status:</div>
                      <div>{selectedAppointment.status}</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock size={16} className="mt-1 mr-2 text-gray-500" />
                    <div>
                      <div className="font-medium">Payment Info:</div>
                      <div>Yes</div>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium mb-2">Medical Notes:</div>
                    <textarea
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                      placeholder="Message text goes here..."
                      rows={4}
                    ></textarea>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
                Select an appointment to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
