import React from 'react';
import KPICard from './KPICard';
import CircularProgress from './CircularProgress';
import { DollarSign } from 'react-feather'; // Import the DollarSign icon from react-feather

const AccountBalancesCard = ({ value = "$17k", total = "$25k", percentage = 68 }) => {
  return (
    <KPICard
      title="Account Balances"
      value={value}
      description={`out of ${total} collected`}
      icon={DollarSign} // Pass the DollarSign icon component
    >
      <CircularProgress percentage={percentage} size={80} />
    </KPICard>
  );
};

export default AccountBalancesCard;
