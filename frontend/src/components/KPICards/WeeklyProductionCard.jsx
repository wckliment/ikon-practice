import React from 'react';
import { BarChart, Bar, XAxis, ReferenceLine, ResponsiveContainer } from 'recharts';
import { MoreHorizontal, BarChart2 } from 'react-feather';

const WeeklyProductionCard = ({ data = defaultData }) => {
  // Get the highest value for highlighting
  const highestDay = data.reduce((max, item) =>
    item.value > max.value ? item : max, data[0]);

  return (
    <div className="bg-white p-5 rounded-[30px] shadow-lg flex flex-col w-full h-[260px] relative">
      {/* Settings icon in the top right */}
      <div className="absolute top-4 right-4 cursor-pointer">
        <div className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#252525] transition duration-300">
          <MoreHorizontal size={16} style={{ strokeWidth: 1.25 }} className="text-gray-700 hover:text-white transition duration-300" />
        </div>
      </div>

      {/* Header with icon and title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-blue-100">
            <BarChart2 size={16} className="text-blue-700" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700">Weekly Production</h2>
        </div>

        {/* Dropdown for Weekly/Monthly/Yearly - Just visual for now */}
        <div className="border border-gray-200 rounded-lg px-3 py-1 flex items-center">
          <span className="text-gray-700 text-sm mr-1">Weekly</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Highlighted Value Section */}
      <div className="flex items-center mb-2">
        <div className="text-teal-500 font-semibold">${highestDay.amount.toLocaleString()}</div>
        <div className="text-gray-500 text-sm ml-2">
          {highestDay.date}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-grow mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            {/* Goal line */}
            <ReferenceLine y={8000} stroke="#aaaaaa" strokeDasharray="3 3" label={{ value: 'goal', position: 'right' }} />

            {/* X-axis (days) */}
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666' }}
            />

            {/* Bars */}
            <Bar
              dataKey="value"
              radius={[10, 10, 10, 10]}
              barSize={30}
              // Highlight the highest day with a pattern fill
              fill={(entry) => entry.day === highestDay.day ? "#5CE1E6" : "#E6F4F1"}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Sample data for the chart
const defaultData = [
  { day: 'Mon', value: 4000, amount: 4000, date: '' },
  { day: 'Tues', value: 3000, amount: 3000, date: '' },
  { day: 'Wed', value: 5000, amount: 5000, date: '' },
  { day: 'Thurs', value: 4500, amount: 4500, date: '' },
  { day: 'Fri', value: 7400, amount: 7400, date: 'Fri, 25th Feb' },
  { day: 'Sat', value: 2000, amount: 2000, date: '' },
  { day: 'Sun', value: 3500, amount: 3500, date: '' },
];

export default WeeklyProductionCard;
