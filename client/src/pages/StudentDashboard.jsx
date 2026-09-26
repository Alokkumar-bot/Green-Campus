import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import { 
  PlusCircle, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  AlertCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function StudentDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getMyReports()
      .then(res => {
        if (isMounted && res.success) {
          setReports(res.reports);
        }
      })
      .catch(err => {
        console.error('Failed to load my reports:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const totalMyReports = reports.length;
  const pendingCount = reports.filter(r => r.status === 'Pending').length;
  const inProgressCount = reports.filter(r => ['In Progress', 'Under Review', 'Assigned'].includes(r.status)).length;
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length;

  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  return (
    <div style={{ padding: '3.5rem 0', backgroundColor: 'var(--bg-main)', minHeight: '85vh' }}>
      <div className="container">
        {/* Welcome Top Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <span style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--primary)'
            }}>
              Student Sustainability Portal
            </span>
            <h1 style={{ fontSize: '2.25rem', color: 'var(--primary-dark)', marginTop: '0.25rem' }}>
              Welcome back, {firstName}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.2rem' }}>
              {user?.department || 'Undergraduate Studies'} • {user?.email}
            </p>
          </div>

          <button
            onClick={() => onNavigate('/report')}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            <PlusCircle size={18} />
            <span>Report New Issue</span>
          </button>
        </div>

        {/* Contribution Impact Callout */}
        <div className="card" style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          backgroundColor: 'var(--primary-subtle)',
          borderColor: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9375rem', color: 'var(--primary-dark)', fontWeight: 700 }}>
              Campus Environmental Contribution
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', margin: 0 }}>
              Your reports have helped identify <strong>{totalMyReports} campus issues</strong>, with <strong>{resolvedCount} already remediated</strong> by maintenance teams.
            </p>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              My Total Reports
            </span>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0.35rem 0' }}>
              {totalMyReports}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Logged by your profile</span>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Pending Review
            </span>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#C2410C', margin: '0.35rem 0' }}>
              {pendingCount}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Awaiting facilities review</span>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              In Progress / Assigned
            </span>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1D4ED8', margin: '0.35rem 0' }}>
              {inProgressCount}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Assigned to squad</span>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Resolved Issues
            </span>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#065F46', margin: '0.35rem 0' }}>
              {resolvedCount}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Remediation completed</span>
          </div>
        </div>

        {/* My Recent Reports Section */}
        <div className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-dark)' }}>
                My Recent Reports
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Track live inspection notes and verified maintenance closures.
              </p>
            </div>

            <button
              onClick={() => onNavigate('/reports')}
              className="btn btn-secondary btn-sm"
            >
              Browse All Campus Reports
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading your reports...
            </div>
          ) : reports.length === 0 ? (
            <div style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
              <AlertCircle size={36} style={{ color: 'var(--text-subtle)', margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-dark)', marginBottom: '0.35rem' }}>
                You haven't submitted any reports yet
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Notice water leaks, overflowing trash, or unneeded lights? File your first report.
              </p>
              <button
                onClick={() => onNavigate('/report')}
                className="btn btn-primary"
              >
                Submit First Report
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Severity</th>
                    <th>Date Filed</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                        {r.report_code}
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.category}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={13} color="var(--primary)" />
                          {r.location}
                        </span>
                      </td>
                      <td>
                        <SeverityBadge severity={r.severity} />
                      </td>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                        {new Date(r.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td>
                        <button
                          onClick={() => onNavigate(`/track?id=${r.report_code}`)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.3rem 0.65rem' }}
                        >
                          <span>Track</span>
                          <ExternalLink size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
