const ConfirmAppointment = ({ appointment, patient,onConfirm, onReject }) => {
  if (!appointment) return null;

  const rawTime = appointment.startTime;

  // Format time
  const displayTime = rawTime.slice(11, 16);
  const formatTo12Hour = (time24) => {
    const [hourStr, minute] = time24.split(":");
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };
  const formattedTime = formatTo12Hour(displayTime);

  // Format date
const dateObj = new Date(rawTime);
const formattedDate = dateObj.toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      {/* Branding */}
      <div className="mb-4 text-center">
        <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight">
          ikonFlow
        </h1>
        <p className="text-lg text-gray-600 italic">The moment care begins.</p>
      </div>

      {/* Greeting */}
      <div className="text-center mb-4">
        <p className="text-xl font-semibold">
  Welcome, {patient?.FName} {patient?.LName}!
</p>
      </div>

      {/* Confirmation Prompt */}
      <div className="bg-white p-6 rounded-xl shadow-md max-w-md text-center">
        <p className="text-lg text-gray-700 mb-2">
          Confirm your appointment:
        </p>
        <p className="text-xl font-medium mb-6">
          {formattedDate} at <strong>{formattedTime}</strong> with{" "}
          <strong>{appointment.providerName || "your provider"}</strong>
        </p>

        {/* Action Buttons */}
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
