import React, { useState } from 'react';
import { MoreHorizontal, AlertTriangle, Calendar, FileText, AlertCircle, Check, Clock } from 'react-feather';

const PatientAlertsCard = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('All');

  // Sample patient alerts data
  const alertsData = [
    {
      id: 1,
      name: 'Sally Smith',
      avatar: '/avatars/sally.jpg',
      type: 'Form Missing',
      status: 'Upload Form',
      icon: FileText,
      statusColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 2,
      name: 'Darlene Allen',
      avatar: '/avatars/darlene.jpg',
      type: 'Balance Owed',
      status: 'Pending Payment',
      icon: Calendar,
      statusColor: 'bg-amber-100 text-amber-700'
    },
    {
      id: 3,
      name: 'Tim Slater',
      avatar: '/avatars/tim.jpg',
      type: 'Medical Alert',
      status: 'Critical - View Alert',
      icon: AlertTriangle,
      statusColor: 'bg-rose-100 text-rose-700'
    },
    {
      id: 4,
      name: 'Bill Johnson',
      avatar: '/avatars/bill.jpg',
      type: 'Shared Appointment',
      status: 'Scheduled',
      icon: Calendar,
      statusColor: 'bg-green-100 text-green-700'
    },
    {
      id: 5,
      name: 'Brooke Adler',
      avatar: '/avatars/brooke.jpg',
      type: 'Missed Appointment',
      status: 'Incomplete - Reminder',
      icon: Clock,
      statusColor: 'bg-amber-100 text-amber-700'
    }
  ];

  // Tabs for filtering alerts
  const tabs = ['All', 'Forms', 'Collections', 'Medical', 'Shared'];

  return (
    <div className="bg-white p-5 rounded-[30px] shadow-lg flex flex-col w-full h-auto min-h-[300px] relative">
      {/* Header section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-purple-100">
            <AlertCircle size={16} className="text-purple-700" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700">Patient Alerts</h2>
        </div>

        {/* See All link */}
        <div className="flex items-center">
          <span className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 mr-2">
            See All
          </span>
          <div className="cursor-pointer">
            <MoreHorizontal size={16} className="text-gray-400 hover:text-gray-600" />
          </div>
        </div>
      </div>

      {/* Tabs for filtering */}
      <div className="flex space-x-2 mb-4 border-b border-gray-200 pb-2">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-gray-800 text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Alert list section */}
      <div className="mt-2">
        <div className="grid grid-cols-12 gap-2 text-sm text-gray-500 font-medium px-2 mb-2">
          <div className="col-span-4">Patient Name</div>
          <div className="col-span-4">Alert Type</div>
          <div className="col-span-4">Status</div>
        </div>

        {/* Alert items */}
        <div className="space-y-3">
          {alertsData.map(alert => (
            <div key={alert.id} className="grid grid-cols-12 gap-2 items-center">
              {/* Patient info */}
              <div className="col-span-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                  <img
                    src={alert.avatar}
                    alt={alert.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/avatars/default.png';
                    }}
                  />
                </div>
                <span className="font-medium text-gray-800">{alert.name}</span>
              </div>

              {/* Alert type */}
              <div className="col-span-4 text-gray-600 bg-gray-100 px-3 py-1 rounded-lg inline-block">
                {alert.type}
              </div>

              {/* Status */}
              <div className="col-span-4">
                <div className={`flex items-center gap-1 ${alert.statusColor} px-3 py-1 rounded-lg text-sm`}>
                  {/* Icon based on alert type */}
                  <alert.icon size={14} />
                  <span>{alert.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientAlertsCard;
