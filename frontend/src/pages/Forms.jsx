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
  const [selectedForm, setSelectedForm] = useState(null); // { name, date, sheetNum }
  const [formFields, setFormFields] = useState([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isLoadingFormFields, setIsLoadingFormFields] = useState(false);


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
    }, 400); // 400ms debounce

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

  const handleFormClick = async (form) => {
    try {
      setIsLoadingFormFields(true);
      setSelectedForm(form);

      const res = await axios.get(`/api/forms/sheet/${form.SheetNum}/fields`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      setFormFields(res.data || []);
      setIsFormModalOpen(true);
    } catch (err) {
      console.error("❌ Failed to fetch form fields:", err);
      alert("Something went wrong fetching form details.");
    } finally {
      setIsLoadingFormFields(false);
    }
  };


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
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">
                    Completed Forms for {selectedPatient.label}
                  </h2>

                  {forms.map((form) => (
                    <div
                      key={form.SheetNum}
                      onClick={() => handleFormClick(form)} // 👉 added click handler here
                      className="bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-pointer"
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

    {/* 🧠 Modal inside return now */}
    {isFormModalOpen && selectedForm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => setIsFormModalOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-black"
          >
            ✕
          </button>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {selectedForm.Description || "Form"}
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            Completed on: {new Date(selectedForm.DateTimeSheet).toLocaleString()}
          </p>

          {isLoadingFormFields ? (
            <div className="text-center text-gray-400 py-10">Loading form fields...</div>
          ) : formFields.length === 0 ? (
            <div className="text-center text-gray-400 py-10">No fields found.</div>
          ) : (
            <div className="space-y-4">
              {formFields.map((field) => (
                <div key={field.SheetFieldNum} className="border-b pb-2">
                  {field.FieldType === "StaticText" && (
                    <p className="text-sm text-gray-700">{field.FieldValue}</p>
                  )}
                  {field.FieldType === "InputField" && (
                    <div>
                      <p className="text-sm font-semibold text-gray-600">{field.FieldName || "Answer"}:</p>
                      <p className="text-sm text-gray-800">{field.FieldValue}</p>
                    </div>
                  )}
                  {field.FieldType === "CheckBox" && (
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" checked={field.FieldValue === "X"} readOnly />
                      <label className="text-sm text-gray-700">
                        {field.FieldName.replace("problem:", "")}
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);



};

export default Forms;
