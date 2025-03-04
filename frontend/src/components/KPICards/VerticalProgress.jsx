import React from 'react';

const VerticalProgress = ({ percentage = 0, height = 60 }) => {
  // Ensure percentage is between 0 and 100
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className="flex items-center gap-2">
      {/* Percentage display - now on the left */}
      <div className="text-sm font-medium">{normalizedPercentage}%</div>

      {/* Pill container */}
      <div
        className="relative w-6 bg-gray-200 rounded-full overflow-hidden"
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
