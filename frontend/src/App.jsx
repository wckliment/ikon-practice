import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; // ✅ Add Navigate import
import Login from "./routes/Login";
import Signup from "./routes/Signup";

const Dashboard = () => {
  return <h1 className="text-center text-2xl font-bold mt-10">Welcome to the Dashboard 🎉</h1>;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Redirect / to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
