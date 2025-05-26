import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PatientLookupForm from "../components/Tablet/PatientLookupForm";
import ConfirmAppointment from "../components/Tablet/ConfirmAppointment";
import CheckInChecklist from "../components/Tablet/CheckInChecklist";
import CompletionScreen from "../components/Tablet/CompletionScreen";
import TabletLogin from "../components/Tablet/TabletLogin";
import PendingForms from "../components/Tablet/PendingForms";
import { socket, connectSocket } from "../socket";

const TabletCheckIn = () => {
  const { locationCode } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [patientData, setPatientData] = useState(null);
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("tabletToken");
    const location = JSON.parse(localStorage.getItem("location"));

    if (token && location) {
      setUser({ token });
      connectSocket(token);

      const room = `location-${location.id}`;

      socket.on("connect", () => {
        socket.emit("join-room", room, (ack) => {
          console.log("✅ Server acknowledged room join:", ack);
        });
        console.log("📡 Joined socket room:", room);
      });

      console.log("👂 Setting up listener for tablet-form...");

      socket.on("tablet-form", ({ token, formName, patientName }) => {
        console.log("📥 Tablet form received:", { formName, patientName });

        const queue = JSON.parse(localStorage.getItem("pendingTabletForms")) || [];

        const alreadyQueued = queue.some((f) => f.token === token);
        if (!alreadyQueued) {
          queue.push({ token, formName, patientName });
          localStorage.setItem("pendingTabletForms", JSON.stringify(queue));
          console.log("💾 Queued tablet form in localStorage:", queue);
        } else {
          console.log("⚠️ Form already in queue. Skipping duplicate.");
        }
      });

      return () => {
        socket.off("tablet-form");
        socket.off("connect");
      };
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
        <PendingForms
          patient={patientData}
          locationCode={locationCode}
          onComplete={goToNext}
        />
      )}

      {step === 4 && (
        <CheckInChecklist
          patient={patientData}
          appointment={appointment}
          locationCode={locationCode}
          onComplete={goToNext}
        />
      )}

      {step === 5 && <CompletionScreen locationCode={locationCode} />}
    </div>
  );
};

export default TabletCheckIn;
