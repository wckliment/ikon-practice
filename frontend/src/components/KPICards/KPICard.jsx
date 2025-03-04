import React from 'react';
import { MoreHorizontal } from 'react-feather';

const KPICard = ({
  title,
  value,
  description,
  children,
  icon: Icon,
  iconBgColor = "#C4D1D1"
}) => {
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
        {Icon && (
          <div className="p-2 rounded-full" style={{ backgroundColor: iconBgColor }}>
            <Icon size={16} className="text-gray-600" />
          </div>
        )}
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      </div>

      {/* Clear layout with circle on the left */}
      <div className="flex items-center mt-4">
        {/* Text content */}
        <div className="flex-grow">
          <p className="text-5xl font-bold">{value}</p>
          <p className="text-gray-500 text-sm mt-0">{description}</p>
        </div>

        {/* Progress circle */}
        {children && (
          <div className="flex-shrink-0 mr-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
