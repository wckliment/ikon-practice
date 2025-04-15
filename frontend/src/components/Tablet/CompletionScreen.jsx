import { Link } from "react-router-dom";

const CompletionScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-md">
        <h2 className="text-3xl font-bold mb-4 text-green-600">You're All Checked In!</h2>
        <p className="text-lg text-gray-600 mb-6">
          Please have a seat — someone will be with you shortly.
        </p>

        
        <Link to="/tablet/login" className="inline-block mt-4 text-blue-600 underline hover:text-blue-800">
  Return to Home
</Link>
      </div>
    </div>
  );
};

export default CompletionScreen;
