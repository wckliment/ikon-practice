import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PatientLookupForm from "../components/Tablet/PatientLookupForm";
import ConfirmAppointment from "../components/Tablet/ConfirmAppointment";
import CheckInChecklist from "../components/Tablet/CheckInChecklist";
import CompletionScreen from "../components/Tablet/CompletionScreen";
import TabletLogin from "../components/Tablet/TabletLogin"; 

const TabletCheckIn = () => {
  const { locationCode } = useParams();

  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [patientData, setPatientData] = useState(null);
  const [appointment, setAppointment] = useState(null);

  // ✅ Try to restore user from localStorage
  useEffect(() => {
    const token = localStorage.getItem("tabletToken");
    if (token) {

      setUser({ token });
    }
  }, []);

  const goToNext = () => setStep((prev) => prev + 1);

  if (!user) {
    return <TabletLogin onLogin={(userData) => setUser(userData)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {step === 1 && (
        <PatientLookupForm
          locationCode={locationCode}
          onSuccess={(patient, apt) => {
            setPatientData(patient);
            setAppointment(apt);
            goToNext();
          }}
        />
      )}
      {step === 2 && (
       <ConfirmAppointment
  appointment={appointment}
  patient={patientData}
  onConfirm={goToNext}
  onReject={() => setStep(1)}
/>
      )}
      {step === 3 && (
        <CheckInChecklist
          patient={patientData}
          appointment={appointment}
          locationCode={locationCode}
          onComplete={goToNext}
        />
      )}
      {step === 4 && <CompletionScreen />}
    </div>
  );
};

export default TabletCheckIn;
