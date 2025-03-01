import React from "react";
import { Search, Bell } from "react-feather"; // Feather icons

const TopBar = () => {
  return (
    <div className="fixed top-16 right-8 flex items-center space-x-6 z-50 w-auto">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex items-center bg-white rounded-full shadow px-4 py-2 w-64 h-12">
          <input
            type="text"
            placeholder="Search ..."
            className="focus:outline-none text-gray-700 text-sm flex-1"
          />
          <Search className="text-white bg-gray-800 rounded-full p-2 w-8 h-8 cursor-pointer" />
        </div>
      </div>

      {/* Notification Icon */}
      <button className="relative p-3 bg-white rounded-full shadow hover:bg-gray-100 transition h-12 w-12 flex items-center justify-center">
        <Bell className="text-gray-600" size={22} />
        <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full"></span>
      </button>
    </div>
  );
};

export default TopBar;

