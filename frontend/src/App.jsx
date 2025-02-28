import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./routes/Login";
import Signup from "./routes/Signup";

const Dashboard = () => {
  return <h1 className="text-center text-2xl font-bold mt-10">Welcome to the Dashboard 🎉</h1>;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
