import React from 'react';

export default function SeverityBadge({ severity, className = '' }) {
  let badgeClass = 'badge-sev-medium';

  switch (severity) {
    case 'Low':
      badgeClass = 'badge-sev-low';
      break;
    case 'Medium':
      badgeClass = 'badge-sev-medium';
      break;
    case 'High':
      badgeClass = 'badge-sev-high';
      break;
    default:
      badgeClass = 'badge-sev-medium';
  }

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      {severity || 'Medium'}
    </span>
  );
}
