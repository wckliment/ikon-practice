import React from 'react';
import { MoreHorizontal } from 'react-feather';

const KPICard = ({
  title,
  value,
  description,
  children,
  icon: Icon,
  iconBgColor = "#C4D1D1" // Default to your specified color
}) => {
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
        {Icon && (
          <div className="p-2 rounded-full" style={{ backgroundColor: iconBgColor }}>
            <Icon size={16} className="text-gray-600" />
          </div>
        )}
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      </div>

      {/* Value with larger font size and description with proper spacing */}
      <div className="mt-2 flex">
        <div>
          <p className="text-5xl font-bold">{value}</p>
          <p className="text-gray-500 text-sm mt-0">{description}</p>
        </div>

        {/* Position the progress indicator to the right of the value */}
        {children && (
          <div className="ml-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
