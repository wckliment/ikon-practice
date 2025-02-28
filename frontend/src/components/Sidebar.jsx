import React from "react";
import { NavLink } from "react-router-dom";
import { Grid, MessageCircle, BarChart2, Edit, Clipboard, MoreHorizontal } from "react-feather"; // Feather Icons

const Sidebar = () => {
  return (
    <div className="relative h-screen flex flex-col items-center pl-12">
      {/* Logo (Stays in Good Position) */}
      <div className="mt-12 mb-4 ml-[-23px]">
        <img src="/logo.svg" alt="Ikon Practice Logo" className="w-22 h-21" />
      </div>

      {/* Sidebar - Moved Higher */}
      <div className="absolute top-[20%] left-8 w-16 bg-white shadow-lg rounded-[50px] flex flex-col items-center py-4">

        {/* Navigation Icons (Big Icons) */}
        <nav className="flex flex-col gap-6">
          <NavLink
            to="/dashboard"
            className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 transition"
          >
            <Grid size={32} />
          </NavLink>

          <NavLink
            to="/messages"
            className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 transition"
          >
            <MessageCircle size={32} />
          </NavLink>

          <NavLink
            to="/analytics"
            className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 transition"
          >
            <BarChart2 size={32} />
          </NavLink>

          <NavLink
            to="/forms"
            className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 transition"
          >
            <Edit size={32} />
          </NavLink>

          <NavLink
            to="/tasks"
            className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 transition"
          >
            <Clipboard size={32} />
          </NavLink>
        </nav>

        {/* Settings Menu */}
        <div className="mt-6">
          <NavLink
            to="/settings"
            className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 transition"
          >
            <MoreHorizontal size={32} />
          </NavLink>
        </div>
      </div>

      {/* Avatar & Logout - Fixed Position at Bottom Left */}
      <div className="absolute left-11 bottom-8 flex flex-col items-center">
        <img
          src="/profile.jpg"
          alt="User Avatar"
          className="w-12 h-12 rounded-full border border-gray-300"
        />
        <NavLink
          to="/logout"
          className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 transition mt-4"
        >
          <img src="/logout-icon.svg" alt="Logout" className="w-6 h-6" />
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
