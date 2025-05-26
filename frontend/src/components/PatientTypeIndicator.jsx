import React from "react";

const PatientTypeIndicator = ({ type = "new", showLabel = false }) => {
  const isNew = type === "new";
  const icon = isNew ? "🆕" : "🔁";
  const label = isNew ? "New Patient" : "Returning Patient";

  const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold";
  const colorClasses = isNew
    ? "bg-yellow-100 text-yellow-800"
    : "bg-green-100 text-green-800";

  return (
    <span className={`${baseClasses} ${colorClasses}`} title={label} aria-label={label}>
      {icon}
      {showLabel && <span className="ml-1">{label}</span>}
    </span>
  );
};

export default PatientTypeIndicator;
