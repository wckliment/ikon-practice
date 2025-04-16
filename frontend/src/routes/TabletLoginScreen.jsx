import { useNavigate } from "react-router-dom";
import TabletLogin from "../components/Tablet/TabletLogin";

const TabletLoginScreen = () => {
  const navigate = useNavigate();

  const handleLogin = (user) => {
    // 🔍 Assumes `user.location_code` is available from backend (you may need to include it!)
    const locationCode = user.location_code || "default-location";

    // 🧭 Redirect to tablet check-in for that location
    navigate(`/tablet-checkin/${locationCode}`);
  };

  return <TabletLogin onLogin={handleLogin} />;
};

export default TabletLoginScreen;
