import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import axios from "axios";
import ReactSelect from "react-select";

const Forms = () => {
  const [searchPatientTerm, setSearchPatientTerm] = useState("");
  const [patientOptions, setPatientOptions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [forms, setForms] = useState([]);
  const [isLoadingForms, setIsLoadingForms] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);



  // 🔍 Debounced patient search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchPatientTerm) {
        try {
          setLoadingPatients(true);
          const res = await axios.get(`/api/patients?search=${encodeURIComponent(searchPatientTerm)}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
          });

          const options = res.data.map((pat) => ({
            label: `${pat.FName} ${pat.LName}`,
            value: pat.PatNum,
          }));

          setPatientOptions(options);
        } catch (err) {
          console.error("❌ Failed to search patients:", err);
          setPatientOptions([]);
        } finally {
          setLoadingPatients(false);
        }
      } else {
        setPatientOptions([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchPatientTerm]);


  // 📋 Fetch forms after selecting a patient
  useEffect(() => {
    const fetchForms = async () => {
      if (selectedPatient) {
        try {
          setIsLoadingForms(true);
          const res = await axios.get(`/api/forms/patient/${selectedPatient.value}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
          });

          setForms(res.data || []);
        } catch (err) {
          console.error("❌ Failed to fetch forms:", err);
          setForms([]);
        } finally {
          setIsLoadingForms(false);
        }
      }
    };

    fetchForms();
  }, [selectedPatient]);




return (
  <div className="flex h-screen bg-[#EBEAE6]">
    <Sidebar />
    <div className="ml-20 w-full">
      <TopBar />
      <div className="px-6 py-4">
        <div className="px-4 pt-0 pb-2 ml-6 mb-24">
          <h1 className="text-5xl font-bold text-gray-800 -mt-5">Forms</h1>
        </div>

        {/* 🧠 Patient search */}
        <div className="max-w-md mx-auto mb-10">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Patient
          </label>
          <ReactSelect
            placeholder="Start typing to search patients..."
            isLoading={loadingPatients}
            options={patientOptions}
            onInputChange={(input) => setSearchPatientTerm(input)}
            onChange={(selected) => setSelectedPatient(selected)}
            value={selectedPatient}
          />
        </div>

        {/* 📋 Forms List */}
        <div className="px-4">
          {isLoadingForms ? (
            <p className="text-center text-gray-500 mt-10">Loading forms...</p>
          ) : selectedPatient ? (
            <>
              {forms.length > 0 ? (
                <div className="space-y-4 max-w-xl ml-6">
                  <h2 className="text-2xl font-bold mb-4">
                    Completed Forms for {selectedPatient.label}
                  </h2>

                  {forms.map((form) => (
                    <div
                      key={form.SheetNum}
                      className="bg-white rounded-lg shadow p-4"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-lg">{form.Description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(form.DateTimeSheet).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 mt-10">
                  No completed forms found for {selectedPatient.label}.
                </p>
              )}
            </>
          ) : (
            <p className="text-center text-gray-400 mt-10">
              Please search and select a patient above.
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
  );

};

export default Forms;
