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
      <div className="flex-1 flex flex-col p-6 ml-[5rem] relative">
        {/* TopBar (Fixed in the top-right corner) */}
        <TopBar />

        {/* Separate Header */}
        <Header />

        {/* ✅ Updated KPI Cards with Fixed Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {/* ✅ Account Balances */}
          <div className="bg-white p-6 rounded-[30px] shadow-lg flex flex-col w-[391px] h-[186px]">
            <h2 className="text-lg font-semibold text-gray-700">Account Balances</h2>
            <p className="text-3xl font-bold mt-2">$17k</p>
            <p className="text-gray-500 text-sm">out of $25k collected</p>
          </div>

          {/* ✅ New Patients */}
          <div className="bg-white p-6 rounded-[30px] shadow-lg flex flex-col w-[391px] h-[186px]">
            <h2 className="text-lg font-semibold text-gray-700">New Patients</h2>
            <p className="text-3xl font-bold mt-2">45</p>
            <p className="text-gray-500 text-sm">out of 60 Total</p>
          </div>

          {/* ✅ Daily Goal */}
          <div className="bg-white p-6 rounded-[30px] shadow-lg flex flex-col w-[391px] h-[186px]">
            <h2 className="text-lg font-semibold text-gray-700">Daily Goal</h2>
            <p className="text-3xl font-bold mt-2">$3.2K</p>
            <p className="text-gray-500 text-sm">out of $5k collected</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
