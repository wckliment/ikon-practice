import React from 'react';
import { MoreHorizontal } from 'react-feather';

const GoogleReviewsCard = ({ current = 12, goal = 20 }) => {
  // Calculate percentage for the gauge
  const percentage = Math.min(100, (current / goal) * 100);

  return (
    <div className="bg-white p-5 rounded-[30px] shadow-lg flex flex-col w-full h-[260px] relative">
      {/* Settings icon in the top right */}
      <div className="absolute top-4 right-4 cursor-pointer">
        <div className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#252525] transition duration-300">
          <MoreHorizontal size={16} style={{ strokeWidth: 1.25 }} className="text-gray-700 hover:text-white transition duration-300" />
        </div>
      </div>

      {/* Header with Google icon and title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Google G icon */}
          <div className="p-2 rounded-full">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#EA4335" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-700">Google Reviews</h2>
        </div>

        {/* "See Detail" button */}
        <div className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
          See Detail
        </div>
      </div>

      {/* Semi-circular gauge */}
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="relative w-48 h-24 mt-2">
          {/* Background arc */}
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 50">
            <path
              d="M5,50 A45,45 0 1,1 95,50"
              fill="none"
              stroke="#EEEEEE"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Colored arc based on progress */}
            <path
              d="M5,50 A45,45 0 1,1 95,50"
              fill="none"
              stroke="#A5B4FC"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 1.4}, 140`}
            />
          </svg>
        </div>

        {/* Values display */}
        <div className="flex justify-between w-48 mt-4">
          <div className="text-center">
            <div className="text-sm text-gray-500">New</div>
            <div className="text-4xl font-bold">{current}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Goal</div>
            <div className="text-4xl font-bold">{goal}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleReviewsCard;
