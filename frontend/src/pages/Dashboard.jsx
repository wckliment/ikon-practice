import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TopBar from "../components/TopBar";
import KPICard from "../components/KPICards/KPICard";
import CircularProgress from "../components/KPICards/CircularProgress";
import { DollarSign, Users, Target } from 'react-feather'; // Import all needed icons

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-dashboardBg">
      {/* Sidebar */}
      <Sidebar />

      {/* Dashboard Content */}
      <div className="flex-1 flex flex-col p-6 ml-[10rem] relative">
        {/* TopBar */}
        <TopBar />

        {/* Header */}
        <Header />

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {/* Account Balances */}
          <KPICard
            title="Account Balances"
            value="$17k"
            description="out of $25k collected"
            icon={DollarSign}
          >
            <CircularProgress percentage={68} size={80} />
          </KPICard>

          {/* New Patients */}
          <KPICard
            title="New Patients"
            value="45"
            description="out of 60 Total"
            icon={Users}
          >
            <CircularProgress percentage={75} size={80} />
          </KPICard>

          {/* Daily Goal */}
          <KPICard
            title="Daily Goal"
            value="$3.2K"
            description="out of $5k collected"
            icon={Target}
          >
            <CircularProgress percentage={64} size={80} />
          </KPICard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
