import React from "react";

const Forms = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Forms</h1>
      <p className="text-gray-600 mb-8">
        Manage patient forms, build new templates, and monitor form completion.
      </p>

      {/* Forms List or Builder will go here */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Available Forms</h2>
        <div className="text-gray-500">
          {/* Placeholder for forms list */}
          No forms available yet.
        </div>
      </div>
    </div>
  );
};

export default Forms;
