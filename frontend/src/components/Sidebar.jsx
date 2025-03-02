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
      {/* ✅ Logo - Stays Fixed */}
      <div className="fixed top-6 left-6 z-50">
        <img src="/logo.svg" alt="Ikon Practice Logo" className="w-20 h-24" />
      </div>

      {/* ✅ Sidebar - Moved Up, Thinner & Taller */}
      <div className="fixed left-8 top-[45%] transform -translate-y-1/2 bg-white shadow-lg rounded-[50px] py-6 px-2 flex flex-col items-center w-[55px] h-[505px] z-50">
        {/* ✅ Navigation Icons */}
        <nav className="flex flex-col gap-6">
          <NavLink to="/dashboard" className="hover:bg-[#252525] group w-12 h-12 flex items-center justify-center rounded-full transition">
            <Grid size={32} className="group-hover:text-white transition duration-300" />
          </NavLink>
          <NavLink to="/messages" className="hover:bg-[#252525] group w-12 h-12 flex items-center justify-center rounded-full transition">
            <MessageCircle size={32} className="group-hover:text-white transition duration-300" />
          </NavLink>
          <NavLink to="/analytics" className="hover:bg-[#252525] group w-12 h-12 flex items-center justify-center rounded-full transition">
            <BarChart2 size={32} className="group-hover:text-white transition duration-300" />
          </NavLink>
          <NavLink to="/forms" className="hover:bg-[#252525] group w-12 h-12 flex items-center justify-center rounded-full transition">
            <Edit size={32} className="group-hover:text-white transition duration-300" />
          </NavLink>
          <NavLink to="/tasks" className="hover:bg-[#252525] group w-12 h-12 flex items-center justify-center rounded-full transition">
            <Clipboard size={32} className="group-hover:text-white transition duration-300" />
          </NavLink>
        </nav>

        {/* ✅ Settings Icon - Inside Sidebar, Correct Size & Padding */}
        <div className="mt-auto flex justify-center w-full pb-4">
          <NavLink
            to="/settings"
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-[#252525] transition duration-300"
          >
            <MoreHorizontal size={32} className="text-gray-700 hover:text-white transition duration-300" />
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
          <LogOut size={32} className="text-gray-700 hover:text-white transition duration-300" />
        </button>
      </div>
    </>
  );
};

export default Sidebar;
