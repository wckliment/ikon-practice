import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TopBar from "../components/TopBar";

const CommunicationHub = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main App Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar - without the welcome message */}
        <TopBar />

        {/* Custom Header for Communication Hub */}
        <div className="px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-800">Communication Hub</h1>
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
