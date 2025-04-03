import React, { useState, useEffect } from "react";
import ReactSelect from "react-select";

const UpdateAppointmentModal = ({
  isOpen,
  onClose,
  appointment,
  staffMembers,
  procedureOptions,
  onUpdate,
  isLoading
}) => {
  const [updatedAppointment, setUpdatedAppointment] = useState({
    patientId: '',
    providerId: '',
    date: '',
    startTime: '',
    duration: 15,
    operatoryId: 0,
    notes: '',
    procedure: ''
  });

  // Initialize form fields when appointment data changes
  useEffect(() => {
    if (appointment) {
      // Extract date and time from appointment
      const aptDateTime = appointment.date ? new Date(`${appointment.date}T00:00:00`) : new Date();
      const date = aptDateTime.toISOString().split('T')[0];

      // Parse time string (assuming format like "10:00 AM")
      let startTime = "";
      if (appointment.fullStartTime) {
        const [time, ampm] = appointment.fullStartTime.split(' ');
        const [hour, minute] = time.split(':');
        let hourNum = parseInt(hour);

        // Convert to 24-hour format for the input
        if (ampm === "PM" && hourNum < 12) hourNum += 12;
        if (ampm === "AM" && hourNum === 12) hourNum = 0;

        startTime = `${hourNum.toString().padStart(2, '0')}:${minute}`;
      }

      setUpdatedAppointment({
        patientId: appointment.patientId || '',
        providerId: appointment.providerId || '',
        date: date,
        startTime: startTime,
        duration: appointment.duration || 15,
        operatoryId: appointment.operatoryId || 0,
        notes: appointment.notes || '',
        procedure: appointment.type || ''
      });
    }
  }, [appointment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedAppointment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePatientSelect = (selectedOption) => {
    if (selectedOption) {
      setUpdatedAppointment(prev => ({
        ...prev,
        patientId: selectedOption.value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!updatedAppointment.date || !updatedAppointment.startTime) {
      alert("Please fill in all required fields");
      return;
    }

    // Format date and time properly for Open Dental API
    const formattedDateTime = `${updatedAppointment.date}T${updatedAppointment.startTime}:00`;

    // Create appointment data object for update
    const appointmentData = {
      id: appointment.id,
      patientId: updatedAppointment.patientId,
      providerId: updatedAppointment.providerId,
      aptDateTime: formattedDateTime,
      duration: parseInt(updatedAppointment.duration) || 15,
      operatoryId: updatedAppointment.operatoryId || 0,
      notes: updatedAppointment.notes || "",
      procedure: updatedAppointment.procedure || ""
    };

    onUpdate(appointmentData);
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Update Appointment</h3>

        <form onSubmit={handleSubmit}>
          {/* Patient info display - usually you don't change the patient */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Patient</label>
            <input
              type="text"
              className="w-full border rounded p-2 bg-gray-100"
              value={appointment?.patientName || ""}
              disabled
            />
          </div>

          {/* Provider Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Provider</label>
            <select
              name="providerId"
              className="w-full border rounded p-2"
              value={updatedAppointment.providerId}
              onChange={handleChange}
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
              name="date"
              className="w-full border rounded p-2"
              value={updatedAppointment.date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Time Picker */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="time"
              name="startTime"
              className="w-full border rounded p-2"
              value={updatedAppointment.startTime}
              onChange={handleChange}
              required
            />
          </div>

          {/* Duration Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Duration (mins)</label>
            <select
              name="duration"
              className="w-full border rounded p-2"
              value={updatedAppointment.duration}
              onChange={handleChange}
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
              name="procedure"
              className="w-full border rounded p-2"
              value={updatedAppointment.procedure}
              onChange={handleChange}
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
              name="notes"
              className="w-full border rounded p-2"
              rows={3}
              placeholder="Enter any additional notes here..."
              value={updatedAppointment.notes}
              onChange={handleChange}
            />
          </div>

          {/* Form Buttons */}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              className="text-sm text-gray-600 hover:underline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAppointmentModal;
