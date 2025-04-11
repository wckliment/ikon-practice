const ConfirmAppointment = ({ appointment, onConfirm, onReject }) => {
  if (!appointment) return null;

  const rawTime = appointment.startTime;

  // 🛑 DO NOT convert it to a Date object — that applies timezone logic
  // ✅ Just extract the "HH:mm" part directly
  const displayTime = rawTime.slice(11, 16); // e.g., "11:00"

  // Optionally convert "13:00" to "1:00 PM"
  const formatTo12Hour = (time24) => {
    const [hourStr, minute] = time24.split(":");
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  const formattedTime = formatTo12Hour(displayTime);

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      <div className="bg-white p-6 rounded-xl shadow-md max-w-md text-center">
        <p className="text-xl font-medium mb-6">
          Is your appointment at <strong>{formattedTime}</strong> with{" "}
          <strong>{appointment.providerName || "your provider"}</strong>?
        </p>
        <div className="flex justify-center space-x-6">
          <button
            onClick={onConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg"
          >
            Yes
          </button>
          <button
            onClick={onReject}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-3 rounded-lg"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmAppointment;
