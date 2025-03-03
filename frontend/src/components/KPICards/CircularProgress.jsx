import React from 'react';

const CircularProgress = ({ percentage = 68, size = 80, strokeWidth = 6 }) => {
  // Calculate values for the SVG
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  // Exact bronze/gold color from your Figma design
  const progressColor = '#D4A76A';
  const bgColor = '#F5F5F5';

  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg className="absolute top-0 left-0" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
      </svg>

      {/* Progress circle */}
      <svg className="absolute top-0 left-0 -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
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
        <span className="text-base font-medium">{percentage}%</span>
      </div>
    </div>
  );
};

export default CircularProgress;
