import React from 'react';
import { Target, MoreHorizontal } from 'react-feather';
import VerticalProgress from './VerticalProgress';

const DailyGoalCard = () => {
  // Sample data - replace with your actual data
  const currentValue = "$3.2K";
  const targetValue = "$5k";
  const percentage = 73; // Percentage complete

  return (
    <div className="bg-white p-6 rounded-[30px] shadow-lg flex flex-col w-[391px] h-[186px] relative">
      {/* Settings icon in the top right */}
      <div className="absolute top-4 right-4 cursor-pointer">
        <MoreHorizontal size={16} className="text-gray-400 hover:text-gray-600" />
      </div>

      <div className="flex items-center gap-3">
        {/* Icon container with custom background color */}
        <div className="p-2 rounded-full" style={{ backgroundColor: "#F8E3CC" }}>
          <Target size={16} className="text-gray-600" />
        </div>
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-700">Daily Goal</h2>
      </div>

      {/* Position the vertical progress indicator in the top-right */}
      <div className="absolute top-12 right-12">
        <VerticalProgress percentage={percentage} height={60} />
      </div>

      {/* Value with larger font size and description with proper spacing */}
      <div className="mt-4">
        <p className="text-4xl font-bold">{currentValue}</p>
        <p className="text-gray-500 text-sm mt-1">out of {targetValue} collected</p>
      </div>
    </div>
  );
};

export default DailyGoalCard;
