import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';
import { MoreHorizontal, BarChart2, Calendar, ChevronDown } from 'react-feather';

const WeeklyProductionCard = () => {
  // State for dropdown open/close
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // State for selected time period
  const [selectedPeriod, setSelectedPeriod] = useState('Weekly');
  // Ref for the dropdown container to detect outside clicks
  const dropdownRef = useRef(null);
  // State for the clicked bar tooltip
  const [clickedBar, setClickedBar] = useState(null);

  // Effect for handling clicks outside the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    // Add event listener when dropdown is open
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Effect to handle clicks outside the chart area to close the tooltip
  useEffect(() => {
    function handleDocumentClick(event) {
      // Check if click was outside of the chart area
      const chartArea = document.querySelector('.recharts-wrapper');
      if (chartArea && !chartArea.contains(event.target)) {
        setClickedBar(null);
      }
    }

    if (clickedBar) {
      document.addEventListener('mousedown', handleDocumentClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [clickedBar]);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle period selection
  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period);
    setIsDropdownOpen(false);
  };

  // Handle bar click to show a tooltip
  const handleBarClick = (data, index) => {
    setClickedBar({
      day: data.day,
      value: data.value,
      amount: data.amount,
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height
    });
  };

  // Data with color property directly embedded
  const data = [
    { day: 'Mon', value: 4000, amount: 4000, color: '#DAECEB' },
    { day: 'Tues', value: 3000, amount: 3000, color: '#DAECEB' },
    { day: 'Wed', value: 5000, amount: 5000, color: '#DAECEB' },
    { day: 'Thurs', value: 4500, amount: 4500, color: '#C7DDE6' },
    { day: 'Fri', value: 7400, amount: 7400, color: '#87CCD0' },
    { day: 'Sat', value: 2000, amount: 2000, color: '#EAE9EB' },
    { day: 'Sun', value: 3500, amount: 3500, color: '#EAE9EB' },
  ];

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
      <div className="flex items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-blue-100">
            <BarChart2 size={16} className="text-blue-700" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700">Weekly Production</h2>
        </div>
      </div>

      {/* Chart - Note: removed the highlighted value section */}

      {/* Weekly dropdown button - positioned directly next to settings icon */}
      <div className="absolute top-5 right-16 z-10">
        <div className="relative" ref={dropdownRef}>
          {/* Dropdown button */}
          <button
            onClick={toggleDropdown}
            className="border border-gray-200 rounded-lg px-3 py-1 flex items-center bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <Calendar size={14} className="text-gray-500 mr-1" />
            <span className="text-gray-700 text-sm mr-1">{selectedPeriod}</span>
            <ChevronDown size={14} className="text-gray-500" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              <ul className="py-1">
                {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((period) => (
                  <li key={period}>
                    <button
                      onClick={() => handlePeriodSelect(period)}
                      className={`block w-full text-left px-4 py-2 text-sm ${selectedPeriod === period ? 'bg-gray-100 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      {period}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-grow mt-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            onClick={(data) => {
              if (data && data.activePayload && data.activePayload.length > 0) {
                const payload = data.activePayload[0].payload;
                handleBarClick({
                  ...payload,
                  x: data.chartX - 45, // Adjust position for tooltip
                  y: data.chartY - 70, // Position above the bar
                });
              } else {
                setClickedBar(null);
              }
            }}
          >
            {/* Define pattern for the highest bar */}
            <defs>
              <pattern id="diagonal-stripe-pattern" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
                <rect width="5" height="10" fill="#5CE1E6" />
              </pattern>
            </defs>

            {/* Goal line */}
            <ReferenceLine y={8000} stroke="#aaaaaa" strokeDasharray="3 3" label={{ value: 'goal', position: 'right' }} />

            {/* X-axis (days) */}
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666' }}
            />

            {/* Bars with custom colors */}
            <Bar
              dataKey="value"
              radius={[10, 10, 10, 10]}
              barSize={30}
              cursor="pointer"
            >
              {data.map((entry, index) => {
                // Use pattern fill for highest day (Friday)
                if (entry.day === highestDay.day) {
                  return <Cell key={`cell-${index}`} fill="url(#diagonal-stripe-pattern)" />;
                }
                // Regular fill for other days
                return <Cell key={`cell-${index}`} fill={entry.color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Custom tooltip on bar click */}
        {clickedBar && (
          <div
            className="absolute bg-white px-3 py-2 rounded-lg shadow-md border border-gray-200 z-30 transition-opacity duration-200"
            style={{
              left: `${clickedBar.x}px`,
              top: `${clickedBar.y}px`,
              transform: 'translate(-50%, -100%)',
              opacity: 1
            }}
          >
            <div className="flex flex-col items-center">
              <span className="text-teal-500 font-semibold">${clickedBar.amount.toLocaleString()}</span>
              <span className="text-gray-500 text-xs">{clickedBar.day}</span>
            </div>
            {/* Arrow pointing down */}
            <div className="absolute h-2 w-2 bg-white border-r border-b border-gray-200 transform rotate-45"
              style={{
                bottom: '-5px',
                left: '50%',
                marginLeft: '-5px'
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyProductionCard;
