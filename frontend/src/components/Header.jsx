import React from "react";
import { useSelector } from "react-redux";

const Header = () => {
  const user = useSelector((state) => state.auth.user);
  const firstName = user?.name ? user.name.split(" ")[0] : "there";

  return (
     <div className="w-full px-[0.5rem] -mt-6 flex items-center"> {/* Adjusted margin */}
      <h1 className="text-4xl font-bold text-gray-800">
        Hi {firstName}, Welcome Back!
      </h1>
    </div>
  );
};

export default Header;
