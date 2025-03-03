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
    <div className="bg-white p-6 rounded-[30px] shadow-lg flex flex-col w-[391px] h-[186px] relative">
      {/* Settings icon in the top right */}
      <div className="absolute top-4 right-4 cursor-pointer">
        <MoreHorizontal size={16} className="text-gray-400 hover:text-gray-600" />
      </div>
      <div className="flex items-center gap-3">
        {/* Icon container with custom background color */}
        {Icon && (
          <div className="p-2 rounded-full" style={{ backgroundColor: iconBgColor }}>
            <Icon size={16} className="text-gray-600" /> {/* Changed from size={20} to size={16} */}
          </div>
        )}
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      </div>
      {/* Position the progress indicator in the top-right but lower and more to the left */}
      {children && (
        <div className="absolute top-12 right-12">
          {children}
        </div>
      )}
      {/* Value with larger font size and description with proper spacing */}
      <div className="mt-4">
        <p className="text-4xl font-bold">{value}</p>
        <p className="text-gray-500 text-sm mt-1">{description}</p>
      </div>
    </div>
  );
};

export default KPICard;
