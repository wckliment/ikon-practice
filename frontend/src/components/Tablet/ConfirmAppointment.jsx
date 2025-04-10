const ConfirmAppointment = ({ appointment, onConfirm, onReject }) => {
  if (!appointment) return null;

 const time = new Date(appointment.startTime).toLocaleString('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      <div className="bg-white p-6 rounded-xl shadow-md max-w-md text-center">
        <p className="text-xl font-medium mb-6">
          Is your appointment at <strong>{time}</strong> with{" "}
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
