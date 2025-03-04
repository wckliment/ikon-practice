import React from 'react';
import { Users, MoreHorizontal } from 'react-feather';

const NewPatientsCard = ({ value = "45", total = "60", percentageChange = -15 }) => {
  return (
    <div className="bg-white p-5 rounded-[30px] shadow-lg w-[391px] h-[186px] relative">
      {/* Settings icon in the top right */}
      <div className="absolute top-4 right-4 cursor-pointer">
        <div className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#252525] transition duration-300">
          <MoreHorizontal size={16} style={{ strokeWidth: 1.25 }} className="text-gray-700 hover:text-white transition duration-300" />
        </div>
      </div>

      {/* Header with icon and title */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-full" style={{ backgroundColor: "#C4D1D1" }}>
          <Users size={16} className="text-gray-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-700">New Patients</h2>
      </div>

      {/* Value and description */}
      <div className="mt-4">
        <p className="text-5xl font-bold">{value}</p>
        <p className="text-gray-500 text-sm mt-0">out of {total} Total</p>
      </div>

      {/* Percentage change */}
      <div className="absolute bottom-6 left-6">
        <span className="text-sm font-medium text-rose-500">~{Math.abs(percentageChange)}% </span>
        <span className="text-sm text-gray-500">Last Month total of {total}</span>
      </div>
    </div>
  );
};

export default NewPatientsCard;
