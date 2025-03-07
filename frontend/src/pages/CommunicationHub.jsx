import React from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const CommunicationHub = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main App Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <TopBar />

        {/* Custom Header - with adjusted positioning */}
        <div className="w-full px-[0.5rem] mt-[4rem] flex items-center pl-20">
          <h1 className="text-4xl font-bold text-gray-800 ml-24">
            Communication Hub
          </h1>
        </div>

        {/* Empty content area - we'll add the actual communication hub content later */}
        <div className="flex-1 p-6">
          {/* This is intentionally left empty for now */}
        </div>
      </div>
    </div>
  );
};

export default CommunicationHub;
