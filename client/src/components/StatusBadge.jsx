import React from 'react';
import { Clock, AlertCircle, CheckCircle2, UserCheck, Wrench } from 'lucide-react';

export default function StatusBadge({ status, className = '' }) {
  let badgeClass = 'badge-pending';
  let Icon = Clock;

  switch (status) {
    case 'Pending':
      badgeClass = 'badge-pending';
      Icon = Clock;
      break;
    case 'Under Review':
      badgeClass = 'badge-review';
      Icon = AlertCircle;
      break;
    case 'Assigned':
      badgeClass = 'badge-assigned';
      Icon = UserCheck;
      break;
    case 'In Progress':
      badgeClass = 'badge-progress';
      Icon = Wrench;
      break;
    case 'Resolved':
      badgeClass = 'badge-resolved';
      Icon = CheckCircle2;
      break;
    default:
      badgeClass = 'badge-pending';
      Icon = Clock;
  }

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      <Icon size={12} strokeWidth={2.5} />
      <span>{status || 'Pending'}</span>
    </span>
  );
}
