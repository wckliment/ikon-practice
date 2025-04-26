import React from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const PracticeAnalytics = () => {
  return (
    <div className="flex h-screen bg-[#EBEAE6]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-20 w-full">
        <TopBar />

        {/* Inner Page Content */}
        <div className="px-6 py-4">
          <div className="px-4 pt-0 pb-2 ml-6 mb-24">
            <h1 className="text-5xl font-bold text-gray-800 -mt-5">Practice Analytics</h1>
          </div>

          {/* Analytics Content Placeholder */}
          <div className="bg-white rounded-2xl shadow p-6 mx-10">
            <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
            <div className="text-gray-500">
              {/* Placeholder for analytics charts, KPIs, reports */}
              Analytics data will appear here.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeAnalytics;
