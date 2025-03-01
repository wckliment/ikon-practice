import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux"; // ✅ Import Redux hooks
import { logout } from "../redux/authSlice"; // ✅ Import logout action
import { Grid, MessageCircle, BarChart2, Edit, Clipboard, MoreHorizontal, LogOut } from "react-feather"; // Feather Icons

const Sidebar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user); // ✅ Get user from Redux state

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login"; // ✅ Redirect to login after logout
  };

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

      {/* User Avatar & Logout - Fixed at Bottom */}
      <div className="absolute bottom-6 flex flex-col items-center">
        {/* User Avatar */}
        <div className="w-12 h-12 mb-4 rounded-full overflow-hidden border-2 border-gray-300">
          <img
            src={user?.profilePicture || "/default-avatar.png"} // ✅ Fix: Use Redux user profile
            alt="User Avatar"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} className="hover:text-red-600">
          <LogOut size={30} className="text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
