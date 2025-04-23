import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const IkonConnect = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get("/api/online-requests", {
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

  return (
    <div className="flex h-screen bg-[#EBEAE6]">
      <Sidebar />
      <div className="ml-20 w-full">
        <TopBar />
        <div className="px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">ikonConnect Requests</h1>

          {isLoading ? (
            <p>Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="text-gray-500">No new requests yet.</p>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold text-lg">{req.patientName}</div>
                    <div className="text-sm text-gray-600">
                      {req.date} at {req.time} • {req.appointmentType}
                    </div>
                  </div>
                  <button className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">
                    Schedule
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IkonConnect;
