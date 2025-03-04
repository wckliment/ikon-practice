import React from 'react';
import { Target, MoreHorizontal } from 'react-feather';
import VerticalProgress from './VerticalProgress';

const DailyGoalCard = () => {
  // Sample data - replace with your actual data
  const currentValue = "$3.2K";
  const targetValue = "$5k";
  const percentage = 73; // Percentage complete

  return (
    <div className="bg-white p-5 rounded-[30px] shadow-lg flex flex-col w-[391px] h-[186px] relative">
      {/* Settings icon in the top right with hover effect matching sidebar */}
      <div className="absolute top-4 right-4 cursor-pointer">
        <div className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#252525] transition duration-300">
          <MoreHorizontal size={16} style={{ strokeWidth: 1.25 }} className="text-gray-700 hover:text-white transition duration-300" />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-2">
        {/* Icon container with custom background color */}
        <div className="p-2 rounded-full" style={{ backgroundColor: "#F8E3CC" }}>
          <Target size={16} className="text-gray-600" />
        </div>
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-700">Daily Goal</h2>
      </div>

      {/* Position the vertical progress indicator in the top-right, higher position */}
      <div className="absolute top-6 right-16">
        <VerticalProgress percentage={percentage} height={140} />
      </div>

      {/* Value with larger font size and description with proper spacing */}
      <div className="mt-2">
        <p className="text-5xl font-bold">{currentValue}</p>
        <p className="text-gray-500 text-sm mt-0">out of {targetValue} collected</p>
      </div>
    </div>
  );
};

export default DailyGoalCard;
