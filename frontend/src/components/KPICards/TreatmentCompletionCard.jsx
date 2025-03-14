import React from 'react';
import KPICard from './KPICard';
import CircularProgress from './CircularProgress';
import { CheckSquare } from 'react-feather'; // Using CheckSquare icon for treatments

const TreatmentCompletionCard = ({ value = "82%", total = "124", percentage = 82 }) => {
  return (
    <KPICard
      title="Treatment Completion"
      value={value}
      description={`${total} treatments completed`}
      icon={CheckSquare}
      iconBgColor="#D1E7DD" // Light green background for the icon
    >
      <CircularProgress
        percentage={percentage}
        width={76}
        height={120}
        strokeWidth={16}
        progressColor="#198754" // Green color for the progress circle
      />
    </KPICard>
  );
};

export default TreatmentCompletionCard;
