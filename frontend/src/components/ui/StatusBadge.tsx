import React from 'react';
import { ConfigStatus } from '@/types/payroll-config';

interface StatusBadgeProps {
  status: ConfigStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles = {
    [ConfigStatus.DRAFT]: 'bg-yellow-100 text-yellow-800',
    [ConfigStatus.APPROVED]: 'bg-green-100 text-green-800',
    [ConfigStatus.REJECTED]: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    [ConfigStatus.DRAFT]: 'Draft',
    [ConfigStatus.APPROVED]: 'Approved',
    [ConfigStatus.REJECTED]: 'Rejected',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
};

