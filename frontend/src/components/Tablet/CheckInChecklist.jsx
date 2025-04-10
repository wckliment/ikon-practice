import { useState } from "react";

const CheckInChecklist = ({ patient, appointment, locationCode, onComplete }) => {
  const [formsCompleted, setFormsCompleted] = useState(false);
  const [paymentCollected, setPaymentCollected] = useState(false);
  const [contactVerified, setContactVerified] = useState(false);

  const isReady = formsCompleted && paymentCollected && contactVerified;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-md text-center">
      <h2 className="text-2xl font-bold mb-6">Check-In Checklist</h2>

      <ChecklistItem
        label="Patient Forms Completed"
        checked={formsCompleted}
        onToggle={() => setFormsCompleted(prev => !prev)}
      />
      <ChecklistItem
        label="Payment Collected"
        checked={paymentCollected}
        onToggle={() => setPaymentCollected(prev => !prev)}
      />
      <ChecklistItem
        label="Contact Info Verified"
        checked={contactVerified}
        onToggle={() => setContactVerified(prev => !prev)}
      />

      <button
        onClick={onComplete}
        className={`mt-8 w-full py-3 rounded ${
          isReady ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        disabled={!isReady}
      >
        Complete Check-In
      </button>
    </div>
  );
};

const ChecklistItem = ({ label, checked, onToggle }) => {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 mb-3 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
      onClick={onToggle}
    >
      <span className="text-lg">{label}</span>
      <span className={`w-5 h-5 border-2 rounded-full ${checked ? "bg-green-600 border-green-600" : "border-gray-400"}`}></span>
    </div>
  );
};

export default CheckInChecklist;
