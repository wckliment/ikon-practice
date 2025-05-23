import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./routes/Login";
import Signup from "./routes/Signup";
import Dashboard from "./pages/Dashboard";
import CommunicationHub from "./pages/CommunicationHub";
import Appointments from "./pages/Appointments";
import Settings from "./pages/Settings";
import TabletCheckIn from './pages/TabletCheckIn';
import TabletLoginScreen from './routes/TabletLoginScreen.jsx';
import IkonConnect from "./pages/IkonConnect";
import Forms from "./pages/Forms";
import PracticeAnalytics from "./pages/PracticeAnalytics";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/communication-hub" element={<CommunicationHub />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/tablet-checkin/:locationCode" element={<TabletCheckIn />} />
        <Route path="/tablet/login" element={<TabletLoginScreen />} />
        <Route path="/ikonconnect" element={<IkonConnect />} />
        <Route path="/forms" element={<Forms />} />
        <Route path="/analytics" element={<PracticeAnalytics />} />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Router>
  );
}
