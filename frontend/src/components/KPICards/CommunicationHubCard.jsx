import React from 'react';
import { MoreHorizontal, MessageCircle } from 'react-feather';

const CommunicationHubCard = () => {
  // Sample communication data WITHOUT avatars
  const communications = [
    {
      id: 1,
      name: 'Sally Johnson',
      status: 'In-Office',
      message: 'Can you check if John Smith\'s medical clearance came in?',
      time: '10:45 AM'
    },
    {
      id: 2,
      name: 'Megan Bening',
      status: 'New Lead',
      message: 'Your 3 o\'clock is here...',
      time: '2:55 PM'
    },
    {
      id: 3,
      name: 'Andy Jones',
      status: 'Patient Communication',
      message: 'Ethan, you\'re right in that...',
      time: '3:22 PM'
    }
  ];

  return (
    <div className="bg-white p-5 rounded-[30px] shadow-lg flex flex-col w-full h-auto max-h-[280px] relative">
      {/* Header section */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-pink-100">
            <MessageCircle size={16} className="text-pink-700" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700">Communication Hub</h2>
        </div>

        {/* See All link */}
        <div className="flex items-center">
          <span className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 mr-2">
            See All
          </span>
          <div className="cursor-pointer">
            <MoreHorizontal size={16} className="text-gray-400 hover:text-gray-600" />
          </div>
        </div>
      </div>

      {/* Communication list with scroll capability */}
      <div className="space-y-3 overflow-y-auto" style={{ maxHeight: "210px" }}>
        {communications.map(comm => (
          <div key={comm.id} className="flex items-start space-x-3 py-2">
            {/* Avatar - Using ONLY initials, NO image tags */}
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-blue-100 flex items-center justify-center">
              <span className="text-blue-700 font-medium text-lg">
                {comm.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>

            {/* Message content */}
            <div className="flex-1 min-w-0">
              {/* Status and name row */}
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <span className="font-medium text-gray-800">{comm.name}</span>
                  {/* Status badge */}
                  <span className="ml-2 px-2 py-0.5 bg-gray-700 text-white text-xs rounded-full">
                    {comm.status}
                  </span>
                </div>
              </div>

              {/* Message text */}
              <p className="text-gray-600 text-sm truncate">{comm.message}</p>
            </div>

            {/* Right section with read more */}
            <div className="text-right flex-shrink-0 ml-2">
              <button className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors">
                Read More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunicationHubCard;

