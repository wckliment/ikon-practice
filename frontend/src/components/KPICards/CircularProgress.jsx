import React from 'react';

const CircularProgress = ({
  percentage = 68,
  width = 80,
  height = 80,
  strokeWidth = 12
}) => {
  // Use the minimum dimension for the radius calculation to ensure the circle fits
  const size = Math.min(width, height);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  // Exact bronze/gold color from your Figma design
  const progressColor = '#D4A76A';
  const bgColor = '#F5F5F5';

  // Calculate center points for the circle
  const centerX = width / 2;
  const centerY = height / 2;

  return (
    <div className="relative inline-flex" style={{ width, height }}>
      {/* Background circle */}
      <svg className="absolute top-0 left-0 w-full h-full" viewBox={`0 0 ${width} ${height}`}>
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="transparent"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
      </svg>

      {/* Progress circle */}
      <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox={`0 0 ${width} ${height}`}>
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="transparent"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-medium">{percentage}%</span>
      </div>
    </div>
  );
};

export default CircularProgress;
