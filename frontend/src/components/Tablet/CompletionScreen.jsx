import { useNavigate } from "react-router-dom";

const CompletionScreen = ({ locationCode }) => {
  console.log("📍 CompletionScreen locationCode:", locationCode);
  const navigate = useNavigate();

  const handleGoHome = () => {
    const path = locationCode ? `/tablet-checkin/${locationCode}` : "/tablet/login";
    console.log("🔁 Navigating to:", path);
    if (window.location.pathname === path) {
    window.location.href = path; // full reload
  } else {
    navigate(path); // client-side nav
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-md">
        <h2 className="text-3xl font-bold mb-4 text-green-600">You're All Checked In!</h2>
        <p className="text-lg text-gray-600 mb-6">
          Please have a seat — someone will be with you shortly.
        </p>

        <button
          onClick={handleGoHome}
          className="inline-block mt-4 text-blue-600 underline hover:text-blue-800"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default CompletionScreen;
