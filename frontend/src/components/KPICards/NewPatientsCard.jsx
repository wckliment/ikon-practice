import React from 'react';
import KPICard from './KPICard';
import { Users } from 'react-feather';

const NewPatientsCard = ({ value = "45", total = "60", percentageChange = -15 }) => {
  return (
    <KPICard
      title="New Patients"
      value={value}
      description={`out of ${total} Total`}
      icon={Users}
    >
      <div className="absolute bottom-6 left-6" style={{ top: 'auto', right: 'auto' }}>
        <span className="text-sm font-medium text-rose-500">~{Math.abs(percentageChange)}% </span>
        <span className="text-sm text-gray-500">Last Month total of {total}</span>
      </div>
    </KPICard>
  );
};

export default NewPatientsCard;
