import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { Grid, MessageCircle, BarChart2, Edit, Clipboard, MoreHorizontal, LogOut } from "react-feather";

const Sidebar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Logo - Always Fixed at the Top */}
      <div className="fixed top-8 left-6 z-50">
        <img src="/logo.svg" alt="Ikon Practice Logo" className="w-20 h-24" />
      </div>

      {/* Sidebar - Fully Locked in Place */}
      <div className="fixed left-6 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-[50px] py-6 px-3 flex flex-col items-center w-[65px] h-[500px] z-50">
        {/* Navigation Icons */}
        <nav className="flex flex-col gap-10">
          <NavLink to="/dashboard">
            <Grid size={36} />
          </NavLink>
          <NavLink to="/messages">
            <MessageCircle size={36} />
          </NavLink>
          <NavLink to="/analytics">
            <BarChart2 size={36} />
          </NavLink>
          <NavLink to="/forms">
            <Edit size={36} />
          </NavLink>
          <NavLink to="/tasks">
            <Clipboard size={36} />
          </NavLink>
        </nav>

        {/* Settings Menu */}
        <MoreHorizontal size={32} className="mt-auto mb-2" />
      </div>

      {/* User Avatar & Logout - Fixed at Bottom */}
      <div className="fixed bottom-8 left-6 flex flex-col items-center space-y-4 z-50">
        {/* User Avatar */}
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300">
          <img src={user?.profilePicture || "/default-avatar.png"} alt="User Avatar" className="w-full h-full object-cover" />
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} className="hover:text-red-600">
          <LogOut size={30} className="text-gray-700" />
        </button>
      </div>
    </>
  );
};

export default Sidebar;
