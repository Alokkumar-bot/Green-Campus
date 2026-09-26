import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Timeline from '../components/Timeline';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Wrench, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Shield,
  Edit3
} from 'lucide-react';

const SQUADS = [
  'Campus Plumbing Squad',
  'Campus Electrical Squad',
  'Sanitation Services',
  'Horticulture & Grounds',
  'Estate Management Division',
  'Sustainability Office'
];

export default function AdminReportDetails({ reportId, onNavigate }) {
  const { isAdmin } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Status update form states
  const [status, setStatus] = useState('Pending');
  const [assignedTo, setAssignedTo] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  const loadReport = () => {
    setLoading(true);
    api.getAdminReportDetails(reportId)
      .then(res => {
        if (res.success && res.report) {
          setReport(res.report);
          setStatus(res.report.status);
          setAssignedTo(res.report.assigned_to || SQUADS[0]);
        } else {
          setErrorMsg('Report not found.');
        }
      })
      .catch(err => {
        setErrorMsg(err.message || 'Failed to load report.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (reportId) {
      loadReport();
    }
  }, [reportId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessNotice('');

    try {
      const res = await api.updateReportStatus(report.id, {
        status,
        assignedTo,
        note: note.trim() || `Status updated to ${status}.`
      });

      if (res.success) {
        setReport(res.report);
        setNote('');
        setSuccessNotice(`Successfully updated report status to "${status}".`);
        setTimeout(() => setSuccessNotice(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update report status.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete report ${report.report_code}?`)) {
      return;
    }

    try {
      const res = await api.deleteReport(report.id);
      if (res.success) {
        alert('Report deleted successfully.');
        onNavigate('/admin');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete report.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="container-narrow" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2>Admin Authentication Required</h2>
        <button onClick={() => onNavigate('/login')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Sign In as Admin
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '6rem 0', textAlign: 'center', backgroundColor: 'var(--bg-main)', minHeight: '80vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading report details...</p>
      </div>
    );
  }

  if (errorMsg || !report) {
    return (
      <div className="container-narrow" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <AlertTriangle size={36} color="#DC2626" style={{ margin: '0 auto 1rem' }} />
        <h2>{errorMsg || 'Report not found.'}</h2>
        <button onClick={() => onNavigate('/admin')} className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
          Return to Admin Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '3.5rem 0', backgroundColor: 'var(--bg-main)', minHeight: '85vh' }}>
      <div className="container">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('/admin')}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Admin Dashboard</span>
        </button>

        {/* Success Notice Banner */}
        {successNotice && (
          <div style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #6EE7B7',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            color: '#065F46',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}>
            <CheckCircle2 size={18} />
            <span>{successNotice}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Left Column: Report Details & Timeline */}
          <div className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {report.report_code}
                </span>
                <h1 style={{ fontSize: '1.85rem', color: 'var(--primary-dark)', marginTop: '0.2rem' }}>
                  {report.category}
                </h1>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <StatusBadge status={report.status} />
                <SeverityBadge severity={report.severity} />
              </div>
            </div>

            {/* Meta Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              backgroundColor: 'var(--bg-subtle)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>Location</span>
                <strong style={{ display: 'block', fontSize: '0.9375rem', color: 'var(--primary-dark)' }}>{report.location}</strong>
                {report.specific_area && <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{report.specific_area}</span>}
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>Date Filed</span>
                <strong style={{ display: 'block', fontSize: '0.9375rem', color: 'var(--primary-dark)' }}>
                  {new Date(report.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>Reporter</span>
                <strong style={{ display: 'block', fontSize: '0.9375rem', color: 'var(--primary-dark)' }}>
                  {report.reporter_name || 'Guest Student'}
                  {report.anonymous === 1 && ' (Anonymous submission)'}
                </strong>
                {report.reporter_email && <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{report.reporter_email}</span>}
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Squad</span>
                <strong style={{ display: 'block', fontSize: '0.9375rem', color: 'var(--primary-dark)' }}>
                  {report.assigned_to || 'Unassigned'}
                </strong>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', color: 'var(--primary-dark)', marginBottom: '0.4rem' }}>Problem Description</h4>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-main)', backgroundColor: '#FFFFFF', padding: '1rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                {report.description}
              </p>
            </div>

            {/* Photo */}
            {report.image_url && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--primary-dark)', marginBottom: '0.4rem' }}>Uploaded Photo</h4>
                <div style={{ maxHeight: '300px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-medium)' }}>
                  <img src={report.image_url} alt="Evidence" style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
                </div>
              </div>
            )}

            {/* Timeline */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', marginBottom: '1rem' }}>
                Resolution Audit Timeline
              </h3>
              <Timeline currentStatus={report.status} updates={report.updates || []} />
            </div>
          </div>

          {/* Right Column: Update Management Console */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={18} color="var(--primary)" /> Update Status & Squad
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Advance ticket through facilities lifecycle and document resolution notes.
              </p>

              <form onSubmit={handleUpdate}>
                <div className="form-group">
                  <label className="form-label">Change Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assign Squad / Department</label>
                  <select
                    className="form-select"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                  >
                    {SQUADS.map(sq => (
                      <option key={sq} value={sq}>{sq}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Resolution / Action Note</label>
                  <textarea
                    className="form-textarea"
                    placeholder="e.g. Leaking pipe replaced by maintenance team."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    style={{ minHeight: '100px' }}
                  />
                  <span className="form-hint">
                    Appended to the public audit log with your admin timestamp.
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  {saving ? 'Publishing Update...' : 'Commit Status Update'}
                </button>
              </form>
            </div>

            {/* Danger Zone: Delete */}
            <div className="card" style={{ padding: '1.5rem', borderColor: '#FCA5A5' }}>
              <h4 style={{ fontSize: '1rem', color: '#991B1B', marginBottom: '0.35rem' }}>
                Delete Report Record
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Permanently purge this report and its timeline history from the database.
              </p>
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-danger btn-sm"
              >
                <Trash2 size={14} /> Delete Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
