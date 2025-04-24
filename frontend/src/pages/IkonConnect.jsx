import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { useSelector } from "react-redux";

const IkonConnect = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get("/api/appointment-requests", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        setRequests(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch online requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleUpdateRequest = async () => {
  try {
    await axios.put(`/api/appointment-requests/${selectedRequest.id}/status`, {
      status: selectedRequest.status,
      handled_by: user?.id || null,
      staff_notes: selectedRequest.staff_notes,
    });

    const updated = requests.map((r) =>
      r.id === selectedRequest.id ? selectedRequest : r
    );
    setRequests(updated);
    setSelectedRequest(null);
  } catch (err) {
    console.error("❌ Failed to update request:", err);
    alert("Something went wrong.");
  }
};

  return (
    <div className="flex h-screen bg-[#EBEAE6]">
      <Sidebar />
      <div className="ml-20 w-full">
        <TopBar />
        <div className="px-6 py-4">
          <div className="px-4 pt-0 pb-2 ml-6 mb-24">
            <h1 className="text-5xl font-bold text-gray-800 -mt-5">ikonConnect</h1>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-500 text-lg">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex items-center justify-center mt-32">
              <p className="text-gray-500 text-lg">No new requests yet.</p>
            </div>
          ) : (
            <div className="mt-6 ml-40 max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-12 mt-4">New Requests</h2>
              <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between transition hover:shadow-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="text-xl font-bold text-gray-800 mr-3">{req.name}</p>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            req.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : req.status === "scheduled"
                              ? "bg-green-100 text-green-800"
                              : req.status === "contacted"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {req.status || "Unknown"}
                        </span>
                      </div>

                      <div className="flex items-center mt-1">
                        <span className="text-sm font-medium text-indigo-600">
                          {req.patient_type === "new" ? "🆕 New Patient" : "🔁 Returning Patient"}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(req.preferred_time).toLocaleString(undefined, {
                          dateStyle: "long",
                          timeStyle: "short",
                        })}{" "}
                        • {req.appointment_type}
                      </p>

                      <p className="text-sm text-gray-600 mt-1">
                        📞 {req.phone || "N/A"} | ✉️ {req.email || "N/A"}
                      </p>

                      {req.notes && (
                        <p className="text-sm text-gray-400 mt-1 italic">{req.notes}</p>
                      )}
                    </div>

                    <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col gap-2">
                      <button className="text-sm px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                        Schedule
                      </button>
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="text-sm px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-xl shadow-lg relative">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4">{selectedRequest.name}</h2>

            <p className="text-sm text-gray-600 mb-2">
              📅 {new Date(selectedRequest.preferred_time).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              🦷 {selectedRequest.appointment_type}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              📞 {selectedRequest.phone} | ✉️ {selectedRequest.email}
            </p>

            <label className="block mt-4 text-sm font-semibold">Staff Notes</label>
            <textarea
              rows="3"
              value={selectedRequest.staff_notes || ""}
              onChange={(e) =>
                setSelectedRequest({ ...selectedRequest, staff_notes: e.target.value })
              }
              className="w-full mt-1 border border-gray-300 rounded-lg p-2"
            ></textarea>

            <label className="block mt-4 text-sm font-semibold">Status</label>
            <select
              value={selectedRequest.status}
              onChange={(e) =>
                setSelectedRequest({ ...selectedRequest, status: e.target.value })
              }
              className="w-full mt-1 border border-gray-300 rounded-lg p-2"
            >
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="scheduled">Scheduled</option>
            </select>

            <button
              onClick={handleUpdateRequest}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Update Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IkonConnect;
