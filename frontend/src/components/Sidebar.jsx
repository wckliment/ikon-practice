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

  // Added custom styles for lighter stroke icons
  const iconStyle = {
    strokeWidth: 1.25, // Reduced from default of 2
  };

  return (
    <>
      {/* ✅ Logo - Stays Fixed */}
      <div className="fixed top-10 left-6 z-50">
        <img src="/logo.svg" alt="Ikon Practice Logo" className="w-20 h-24" />
      </div>

      {/* ✅ Sidebar - Modified with fine-tuned spacing */}
      <div className="fixed left-10 top-[45%] transform -translate-y-1/2 bg-white shadow-lg rounded-[50px] py-8 px-2 flex flex-col items-center w-[55px] h-[505px] z-50">
        {/* Top section with navigation icons - reduced vertical spacing */}
        <div className="flex flex-col items-center space-y-9 mb-12">
          <NavLink to="/dashboard" className="hover:bg-[#252525] group w-12 h-12 flex items-center justify-center rounded-full transition">
            <Grid size={36} style={iconStyle} className="group-hover:text-white transition duration-300" />
          </NavLink>
          <NavLink to="/messages" className="hover:bg-[#252525] group w-12 h-12 flex items-center justify-center rounded-full transition">
            <MessageCircle size={36} style={iconStyle} className="group-hover:text-white transition duration-300" />
          </NavLink>
          <NavLink to="/analytics" className="hover:bg-[#252525] group w-12 h-12 flex items-center justify-center rounded-full transition">
            <BarChart2 size={36} style={iconStyle} className="group-hover:text-white transition duration-300" />
          </NavLink>
          <NavLink to="/forms" className="hover:bg-[#252525] group w-12 h-12 flex items-center justify-center rounded-full transition">
            <Edit size={36} style={iconStyle} className="group-hover:text-white transition duration-300" />
          </NavLink>
          <NavLink to="/tasks" className="hover:bg-[#252525] group w-12 h-12 flex items-center justify-center rounded-full transition">
            <Clipboard size={36} style={iconStyle} className="group-hover:text-white transition duration-300" />
          </NavLink>
        </div>

        {/* Settings Icon at the bottom with moderate spacing */}
        <div className="mb-6">
          <NavLink
            to="/settings"
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-[#252525] transition duration-300"
          >
            <MoreHorizontal size={26} style={iconStyle} className="text-gray-700 hover:text-white transition duration-300" />
          </NavLink>
        </div>
      </div>

      {/* ✅ Avatar & Logout - Fixed in Position, Correctly Sized */}
      <div className="fixed bottom-8 left-10 flex flex-col items-center space-y-6 z-50">
        {/* User Avatar */}
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300">
          <img src={user?.profilePicture || "/default-avatar.png"} alt="User Avatar" className="w-full h-full object-cover" />
        </div>
        {/* ✅ Fixed Logout Button Padding & Size */}
        <button
          onClick={handleLogout}
          className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-[#252525] transition duration-300"
        >
          <LogOut size={32} style={iconStyle} className="text-gray-700 hover:text-white transition duration-300" />
        </button>
      </div>
    </>
  );
};

export default Sidebar;
