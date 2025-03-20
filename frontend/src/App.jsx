import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./routes/Login";
import Signup from "./routes/Signup";
import Dashboard from "./pages/Dashboard";
import CommunicationHub from "./pages/CommunicationHub";
import Appointments from "./pages/Appointments";

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
      </Routes>
    </Router>
  );
}
