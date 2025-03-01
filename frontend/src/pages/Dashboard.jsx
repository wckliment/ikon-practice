import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TopBar from "../components/TopBar"; // ✅ Import the TopBar component

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-dashboardBg">
      {/* Sidebar */}
      <Sidebar />

      {/* Dashboard Content */}
      <div className="flex-1 flex flex-col p-6 ml-[5rem] relative"> {/* Added 'relative' for proper positioning */}

        {/* TopBar (Fixed in the top-right corner) */}
        <TopBar />

        {/* Separate Header */}
        <Header />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold text-gray-700">KPI Title</h2>
            <p className="text-gray-600">KPI Details</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold text-gray-700">Another KPI</h2>
            <p className="text-gray-600">More details</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
