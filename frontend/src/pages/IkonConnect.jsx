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






  return (
    <div className="flex h-screen bg-[#EBEAE6]">
      <Sidebar />
      <div className="ml-20 w-full">
        <TopBar />
        <div className="px-6 py-4">
          <div className="px-4 pt-0 pb-2 ml-6">
            <h1 className="text-5xl font-bold text-gray-800 -mt-5">
              ikonConnect
            </h1>
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
            <div className="mt-6 px-4 ml-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">New Requests</h2>
              <div className="space-y-4">

  {requests.map((req) => (
    <div
      key={req.id}
      className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between transition hover:shadow-lg"
    >
      <div className="mb-4 sm:mb-0">
        <p className="text-xl font-bold text-gray-800">{req.patientName}</p>
        <p className="text-sm text-gray-500 mt-1">
          {req.date} at {req.time} &bull; {req.appointmentType}
        </p>
        {req.notes && (
          <p className="text-sm text-gray-400 mt-1 italic">
            {req.notes}
          </p>
        )}
      </div>

      <button className="self-start sm:self-auto text-sm px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
        Schedule
      </button>
    </div>
  ))}
</div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IkonConnect;
