import React from 'react';

const VerticalProgress = ({ percentage = 0, height = 60 }) => {
  // Ensure percentage is between 0 and 100
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className="flex flex-col items-center">
      {/* Percentage display */}
      <div className="text-sm font-medium mb-2">{normalizedPercentage}%</div>

      {/* Pill container */}
      <div
        className="relative w-3 bg-gray-200 rounded-full overflow-hidden"
        style={{ height: `${height}px` }}
      >
        {/* Filled portion */}
        <div
          className="absolute bottom-0 w-full bg-indigo-400 rounded-full transition-all duration-500"
          style={{ height: `${normalizedPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default VerticalProgress;
