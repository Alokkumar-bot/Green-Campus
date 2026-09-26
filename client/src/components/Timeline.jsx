import React from 'react';
import { Check, Clock, CircleDot, AlertCircle, Wrench, CheckCircle2 } from 'lucide-react';

const STAGES = [
  { key: 'Pending', label: 'Report Submitted', desc: 'Received and registered in system' },
  { key: 'Under Review', label: 'Under Review', desc: 'Sustainability officer evaluating issue' },
  { key: 'Assigned', label: 'Assigned', desc: 'Maintenance squad dispatched' },
  { key: 'In Progress', label: 'In Progress', desc: 'Technicians resolving problem on-site' },
  { key: 'Resolved', label: 'Resolved', desc: 'Fixed and verified by campus staff' }
];

const STAGE_ORDER = {
  'Pending': 0,
  'Under Review': 1,
  'Assigned': 2,
  'In Progress': 3,
  'Resolved': 4
};

export default function Timeline({ currentStatus, updates = [] }) {
  const currentStageIndex = STAGE_ORDER[currentStatus] !== undefined ? STAGE_ORDER[currentStatus] : 0;

  // Map each update to its status if available
  const updateMap = {};
  updates.forEach(u => {
    updateMap[u.status] = u;
  });

  return (
    <div className="timeline-container" style={{ margin: '1.5rem 0' }}>
      <div className="timeline-stepper" style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentStageIndex || (idx === currentStageIndex && currentStatus === 'Resolved');
          const isCurrent = idx === currentStageIndex && currentStatus !== 'Resolved';
          const isUpcoming = idx > currentStageIndex;
          const stageUpdate = updateMap[stage.key];

          return (
            <div key={stage.key} style={{
              display: 'flex',
              gap: '1.25rem',
              position: 'relative',
              paddingBottom: idx === STAGES.length - 1 ? 0 : '1.75rem'
            }}>
              {/* Connecting vertical line */}
              {idx < STAGES.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: '15px',
                  top: '32px',
                  bottom: '0',
                  width: '2px',
                  backgroundColor: isCompleted ? 'var(--primary)' : 'var(--border-medium)',
                  transition: 'background-color 0.3s ease'
                }} />
              )}

              {/* Indicator Circle */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isCompleted 
                  ? 'var(--primary)' 
                  : isCurrent 
                    ? '#FFFFFF' 
                    : '#FFFFFF',
                border: isCompleted 
                  ? '2px solid var(--primary)' 
                  : isCurrent 
                    ? '2px solid var(--primary)' 
                    : '2px solid var(--border-medium)',
                boxShadow: isCurrent ? '0 0 0 4px rgba(31, 93, 66, 0.15)' : 'none',
                color: isCompleted ? '#FFFFFF' : isCurrent ? 'var(--primary)' : 'var(--text-subtle)',
                zIndex: 2,
                flexShrink: 0
              }}>
                {isCompleted ? (
                  <Check size={16} strokeWidth={2.5} />
                ) : isCurrent ? (
                  <CircleDot size={18} strokeWidth={2.5} />
                ) : (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{idx + 1}</span>
                )}
              </div>

              {/* Stage content */}
              <div style={{ flex: 1, paddingTop: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: isCurrent || isCompleted ? 700 : 500,
                    color: isUpcoming ? 'var(--text-subtle)' : 'var(--primary-dark)'
                  }}>
                    {stage.label}
                  </h4>
                  {stageUpdate && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                      {new Date(stageUpdate.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>

                <p style={{
                  fontSize: '0.8125rem',
                  color: isUpcoming ? 'var(--text-subtle)' : 'var(--text-muted)',
                  marginTop: '0.15rem'
                }}>
                  {stage.desc}
                </p>

                {/* Specific resolution note or update text */}
                {stageUpdate && stageUpdate.note && (
                  <div style={{
                    marginTop: '0.5rem',
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '3px solid var(--primary)',
                    fontSize: '0.875rem',
                    color: 'var(--text-main)'
                  }}>
                    <p style={{ margin: 0 }}>{stageUpdate.note}</p>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
                      Logged by: <strong>{stageUpdate.updated_by}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
