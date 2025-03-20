import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { Grid, MessageCircle, BarChart2, Edit, Clipboard, MoreHorizontal, LogOut } from "react-feather";

const Sidebar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // State to track which icon is being hovered
  const [hoveredIcon, setHoveredIcon] = useState(null);

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

  // Tooltip component for sidebar icons
  const Tooltip = ({ text, visible, positionClass = "left-16" }) => {
    if (!visible) return null;

    return (
      <div className={`absolute ${positionClass} bg-gray-800 text-white px-3 py-1 rounded text-sm whitespace-nowrap z-50 transition-opacity duration-200 -translate-y-1/2 top-1/2`}>
        {text}
        {/* Triangle pointer */}
        <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 border-t-4 border-r-4 border-b-4 border-transparent border-r-gray-800"></div>
      </div>
    );
  };

  // NavIcon component with tooltip
  const NavIcon = ({ to, icon: Icon, tooltipText }) => {
    return (
      <div className="relative">
        <NavLink
          to={to}
          className="hover:bg-[#252525] group w-12 h-12 flex items-center justify-center rounded-full transition"
          onMouseEnter={() => setHoveredIcon(tooltipText)}
          onMouseLeave={() => setHoveredIcon(null)}
        >
          <Icon size={36} style={iconStyle} className="group-hover:text-white transition duration-300" />
        </NavLink>
        <Tooltip text={tooltipText} visible={hoveredIcon === tooltipText} />
      </div>
    );
  };

  return (
    <>
      {/* ✅ Logo - Stays Fixed */}
      <div className="fixed top-10 left-6 z-50">
        <img src="/logo.svg" alt="Ikon Practice Logo" className="w-20 h-24" />
      </div>

      {/* ✅ Sidebar - Modified with fine-tuned spacing */}
      <div className="fixed left-10 top-[45%] transform -translate-y-1/2 bg-white shadow-lg rounded-[50px] py-8 px-2 flex flex-col items-center w-[55px] h-[505px] z-40">
        {/* Top section with navigation icons - reduced vertical spacing */}
        <div className="flex flex-col items-center space-y-9 mb-12">
          <NavIcon to="/dashboard" icon={Grid} tooltipText="Dashboard" />
          <NavIcon to="/communication-hub" icon={MessageCircle} tooltipText="Communication Hub" />
          <NavIcon to="/analytics" icon={BarChart2} tooltipText="Practice Analytics" />
          <NavIcon to="/forms" icon={Edit} tooltipText="Forms" />
          <NavIcon to="/appointments" icon={Clipboard} tooltipText="Appointments" />
        </div>

        {/* Settings Icon at the bottom with moderate spacing */}
        <div className="mb-6 relative">
          <NavLink
            to="/settings"
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-[#252525] transition duration-300"
            onMouseEnter={() => setHoveredIcon("Settings")}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <MoreHorizontal size={26} style={iconStyle} className="text-gray-700 hover:text-white transition duration-300" />
          </NavLink>
          <Tooltip text="Settings" visible={hoveredIcon === "Settings"} />
        </div>
      </div>

      {/* ✅ Avatar & Logout - Fixed in Position, Correctly Sized */}
      <div className="fixed bottom-8 left-10 flex flex-col items-center space-y-6 z-40">
        {/* User Avatar */}
        <div
          className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300 relative"
          onMouseEnter={() => setHoveredIcon("Profile")}
          onMouseLeave={() => setHoveredIcon(null)}
        >
          <img src={user?.profilePicture || "/default-avatar.png"} alt="User Avatar" className="w-full h-full object-cover" />
          <Tooltip text="Your Profile" visible={hoveredIcon === "Profile"} />
        </div>

        {/* ✅ Fixed Logout Button Padding & Size */}
        <div className="relative">
          <button
            onClick={handleLogout}
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-[#252525] transition duration-300"
            onMouseEnter={() => setHoveredIcon("Logout")}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <LogOut size={32} style={iconStyle} className="text-gray-700 hover:text-white transition duration-300" />
          </button>
          <Tooltip text="Logout" visible={hoveredIcon === "Logout"} />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
