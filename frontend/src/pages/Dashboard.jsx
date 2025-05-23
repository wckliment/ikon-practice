import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TopBar from "../components/TopBar";
import KPICard from "../components/KPICards/KPICard";
import CircularProgress from "../components/KPICards/CircularProgress";
import DailyGoalCard from "../components/KPICards/DailyGoalCard";
import TreatmentCompletionCard from "../components/KPICards/TreatmentCompletionCard"; // Add this import
import WeeklyProductionCard from "../components/KPICards/WeeklyProductionCard";
import GoogleReviewsCard from "../components/KPICards/GoogleReviewsCard";
import PatientAlertsCard from "../components/KPICards/PatientAlertsCard";
import CommunicationHubCard from "../components/KPICards/CommunicationHubCard";
import { DollarSign, Target, Users, MoreHorizontal } from 'react-feather';

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-dashboardBg">
      {/* Sidebar */}
      <Sidebar />

      {/* Dashboard Content */}
      <div className="flex-1 flex flex-col p-6 ml-[7.5rem] relative">
        {/* TopBar */}
        <TopBar />

        {/* Header */}
        <Header />

        {/* First Row - KPI Cards - Updated grid-cols-4 for 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {/* Account Balances */}
          <KPICard
            title="Account Balances"
            value="$17k"
            description="out of $25k collected"
            icon={DollarSign}
            iconBgColor="#F8E3CC"
          >
            <CircularProgress
              percentage={68}
              width={100}
              height={100}
              strokeWidth={18}
            />
          </KPICard>

          {/* New Patients - Custom Implementation */}
          <div className="bg-white p-6 rounded-[30px] shadow-lg flex flex-col w-[391px] h-[186px] relative">
            {/* Settings icon in the top right */}
            <div className="absolute top-4 right-4 cursor-pointer">
              <MoreHorizontal size={16} className="text-gray-400 hover:text-gray-600" />
            </div>
            <div className="flex items-center gap-3">
              {/* Icon container with custom background color */}
              <div className="p-2 rounded-full" style={{ backgroundColor: "#C4D1D1" }}>
                <Users size={16} className="text-gray-600" />
              </div>
              {/* Title */}
              <h2 className="text-lg font-semibold text-gray-700">New Patients</h2>
            </div>
            {/* Value with larger font size and description with proper spacing */}
            <div className="mt-4">
              <div className="flex items-center">
                <div>
                  <p className="text-5xl font-bold">45</p>
                  <p className="text-gray-500 text-sm mt-1">out of 60 Total</p>
                </div>
                {/* Percentage text to the right */}
                <div className="ml-8">
                  <span className="text-sm font-medium text-rose-500">~15% </span>
                  <span className="text-sm text-gray-500">Last Month total of 60</span>
                </div>
              </div>
            </div>
          </div>

          {/* Treatment Completion Card - New Card */}
          <TreatmentCompletionCard />

          {/* Daily Goal - New Component */}
          <DailyGoalCard />
        </div>

        {/* Rest of your dashboard remains the same */}
        {/* Second Row - Weekly Production and Google Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mt-4">
          {/* Weekly Production Card - Spans 5 columns (71%) */}
          <div className="lg:col-span-5">
            <WeeklyProductionCard />
          </div>

          {/* Google Reviews Card - Spans 2 columns (29%) */}
          <div className="lg:col-span-2">
            <GoogleReviewsCard current={12} goal={20} />
          </div>
        </div>

        {/* Third Row - Patient Alerts and Communication Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Patient Alerts Card */}
          <div>
            <PatientAlertsCard />
          </div>

          {/* Communication Hub Card */}
          <div>
            <CommunicationHubCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
