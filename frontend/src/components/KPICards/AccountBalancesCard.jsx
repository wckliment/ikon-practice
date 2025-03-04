import React from 'react';
import KPICard from './KPICard';
import CircularProgress from './CircularProgress';
import { DollarSign } from 'react-feather';

const AccountBalancesCard = ({ value = "$17k", total = "$25k", percentage = 68 }) => {
  return (
    <KPICard
      title="Account Balances"
      value={value}
      description={`out of ${total} collected`}
      icon={DollarSign}
      iconBgColor="#F8E3CC" // Match the gold theme of the progress circle
    >
      <CircularProgress
        percentage={percentage}
        width={76}
        height={120} // Increased height to make it taller
        strokeWidth={16}
      />
    </KPICard>
  );
};

export default AccountBalancesCard;
