import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import { 
  Shield, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Clock, 
  MapPin, 
  X,
  Send,
  Wrench
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Water Leakage',
  'Waste / Overflowing Bin',
  'Littering',
  'Electricity Wastage',
  'AC / Appliance Wastage',
  'Green Space / Plants',
  'Waste Segregation',
  'Other'
];

const STATUSES = ['All', 'Pending', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];
const SEVERITIES = ['All', 'Low', 'Medium', 'High'];

const SQUADS = [
  'Campus Plumbing Squad',
  'Campus Electrical Squad',
  'Sanitation Services',
  'Horticulture & Grounds',
  'Estate Management Division',
  'Sustainability Office'
];

export default function AdminDashboard({ onNavigate }) {
  const { user, isAdmin } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [locationsList, setLocationsList] = useState(['All']);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, pages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [location, setLocation] = useState('All');
  const [severity, setSeverity] = useState('All');

  // Status Update Modal State
  const [activeModalReport, setActiveModalReport] = useState(null);
  const [newStatus, setNewStatus] = useState('In Progress');
  const [assignedSquad, setAssignedSquad] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Delete Confirmation Modal State
  const [deleteTargetReport, setDeleteTargetReport] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load locations
  useEffect(() => {
    api.getLocations().then(res => {
      if (res.success && res.locations) {
        setLocationsList(['All', ...res.locations.map(l => l.name)]);
      }
    }).catch(() => {});
  }, []);

  const loadData = (pageNumber = 1) => {
    setLoading(true);
    // Fetch stats
    api.getStats().then(res => {
      if (res.success) setStats(res.stats);
    }).catch(() => {});

    // Fetch reports
    api.getAdminReports({
      category,
      status,
      location,
      severity,
      search,
      page: pageNumber,
      limit: 15
    })
      .then(res => {
        if (res.success) {
          setReports(res.reports);
          setPagination(res.pagination);
        }
      })
      .catch(err => {
        console.error('Error fetching admin reports:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData(1);
  }, [category, status, location, severity]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData(1);
  };

  const openStatusModal = (report) => {
    setActiveModalReport(report);
    setNewStatus(report.status);
    setAssignedSquad(report.assigned_to || SQUADS[0]);
    setResolutionNote('');
    setActionSuccessMsg('');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!activeModalReport) return;

    setUpdatingStatus(true);
    try {
      const res = await api.updateReportStatus(activeModalReport.id, {
        status: newStatus,
        assignedTo: assignedSquad,
        note: resolutionNote.trim() || `Status updated to ${newStatus}.`
      });

      if (res.success) {
        setActionSuccessMsg(`Updated ${activeModalReport.report_code} to ${newStatus}`);
        setTimeout(() => {
          setActiveModalReport(null);
          loadData(pagination.page);
        }, 1200);
      }
    } catch (err) {
      alert(err.message || 'Failed to update report status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetReport) return;
    setDeleting(true);
    try {
      const res = await api.deleteReport(deleteTargetReport.id);
      if (res.success) {
        setDeleteTargetReport(null);
        loadData(pagination.page);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete report.');
    } finally {
      setDeleting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container-narrow" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <Shield size={48} style={{ color: '#DC2626', margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '2rem', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
          Admin Authentication Required
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          You must be logged in as an authorized administrator to access the campus maintenance command center.
        </p>
        <button
          onClick={() => onNavigate('/login')}
          className="btn btn-primary"
        >
          Sign in as Admin
        </button>
      </div>
    );
  }

  const total = stats?.total ?? reports.length;
  const pending = stats?.pending ?? 0;
  const inProgress = (stats?.inProgress ?? 0) + (stats?.under_review ?? 0) + (stats?.assigned ?? 0);
  const resolved = stats?.resolved ?? 0;
  const highPriority = stats?.highPriority ?? 0;

  return (
    <div style={{ padding: '3rem 0', backgroundColor: 'var(--bg-main)', minHeight: '85vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-assigned" style={{ padding: '0.2rem 0.5rem' }}>
                <Shield size={12} /> Administrator Privileges
              </span>
            </div>
            <h1 style={{ fontSize: '2.25rem', color: 'var(--primary-dark)', marginTop: '0.35rem' }}>
              Campus Facilities & Sustainability Operations
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              Real-time issue triage, squad assignment, and resolution audit console.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => onNavigate('/impact')}
              className="btn btn-secondary"
            >
              Analytics Dashboard
            </button>
            <button
              onClick={() => loadData(pagination.page)}
              className="btn btn-secondary"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* 1. Overview Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Total Reports
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0.25rem 0' }}>
              {total}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>All-time submissions</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Pending Triage
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#C2410C', margin: '0.25rem 0' }}>
              {pending}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Unreviewed submissions</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              In Progress / Assigned
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1D4ED8', margin: '0.25rem 0' }}>
              {inProgress}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Squads operating</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Resolved Issues
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#065F46', margin: '0.25rem 0' }}>
              {resolved}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Verified closures</span>
          </div>

          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }}>
            <span style={{ fontSize: '0.75rem', color: '#991B1B', textTransform: 'uppercase', fontWeight: 700 }}>
              High Priority
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#DC2626', margin: '0.25rem 0' }}>
              {highPriority}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#991B1B' }}>Hazard or critical leak</span>
          </div>
        </div>

        {/* 2. Filters & Search */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-xs)' }}>
          <form onSubmit={handleSearchSubmit} style={{
            display: 'grid',
            gridTemplateColumns: '1.8fr 1fr 1fr 1fr 1fr auto',
            gap: '0.75rem',
            alignItems: 'center'
          }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search ID, reporter, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.25rem', fontSize: '0.875rem' }}
              />
              <Search
                size={15}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}
              />
            </div>

            {/* Category */}
            <div>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ fontSize: '0.875rem' }}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ fontSize: '0.875rem' }}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div>
              <select
                className="form-select"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                style={{ fontSize: '0.875rem' }}
              >
                {SEVERITIES.map(sv => (
                  <option key={sv} value={sv}>{sv === 'All' ? 'All Severities' : `${sv} Severity`}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <select
                className="form-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ fontSize: '0.875rem' }}
              >
                {locationsList.map(loc => (
                  <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
                ))}
              </select>
            </div>

            {/* Reset */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              title="Reset Filters"
              onClick={() => {
                setSearch('');
                setCategory('All');
                setStatus('All');
                setSeverity('All');
                setLocation('All');
              }}
            >
              <RefreshCw size={14} />
            </button>
          </form>
        </div>

        {/* 3. Reports Table */}
        <div className="card" style={{ padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Showing <strong>{reports.length}</strong> of <strong>{pagination.total}</strong> reports
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading admin records...
            </div>
          ) : reports.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-subtle)' }}>
              No reports match your filters.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Reporter Info</th>
                    <th>Severity</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Actions</th>
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
                          <MapPin size={12} color="var(--primary)" />
                          {r.location}
                        </span>
                      </td>
                      <td>
                        {r.anonymous === 1 ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                            Anonymous ({r.reporter_name || 'Student'})
                          </span>
                        ) : (
                          <div style={{ fontSize: '0.8125rem' }}>
                            <strong>{r.reporter_name || 'Guest'}</strong>
                            {r.reporter_email && (
                              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                                {r.reporter_email}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        <SeverityBadge severity={r.severity} />
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {new Date(r.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-main)', maxWidth: '140px' }}>
                        {r.assigned_to || <span style={{ color: 'var(--text-subtle)' }}>Unassigned</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            onClick={() => onNavigate(`/admin/reports/${r.id}`)}
                            className="btn btn-secondary btn-sm"
                            title="View full report"
                            style={{ padding: '0.3rem 0.5rem' }}
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            onClick={() => openStatusModal(r)}
                            className="btn btn-primary btn-sm"
                            title="Update Status / Notes"
                            style={{ padding: '0.3rem 0.5rem' }}
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            onClick={() => setDeleteTargetReport(r)}
                            className="btn btn-danger btn-sm"
                            title="Delete Report"
                            style={{ padding: '0.3rem 0.5rem' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              <button
                onClick={() => loadData(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <span style={{ fontSize: '0.875rem', padding: '0 0.75rem', color: 'var(--text-muted)' }}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => loadData(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Update Status & Resolution Notes Modal */}
      {activeModalReport && (
        <div className="modal-overlay" onClick={() => setActiveModalReport(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-dark)', margin: 0 }}>
                  Update Report: {activeModalReport.report_code}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalReport(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit}>
              <div className="modal-body">
                {actionSuccessMsg ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#15803D' }}>
                    <CheckCircle2 size={36} style={{ margin: '0 auto 0.5rem' }} />
                    <strong style={{ fontSize: '1.1rem' }}>{actionSuccessMsg}</strong>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      <strong>{activeModalReport.category}</strong> at <strong>{activeModalReport.location}</strong>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Change Status</label>
                      <select
                        className="form-select"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
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
                        value={assignedSquad}
                        onChange={(e) => setAssignedSquad(e.target.value)}
                      >
                        {SQUADS.map(sq => (
                          <option key={sq} value={sq}>{sq}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Resolution / Progress Notes</label>
                      <textarea
                        className="form-textarea"
                        placeholder="e.g. Leaking pipe replaced by maintenance team and verified water tight."
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                        style={{ minHeight: '90px' }}
                      />
                      <span className="form-hint">
                        This note will be logged into the public audit timeline with your admin signature.
                      </span>
                    </div>
                  </>
                )}
              </div>

              {!actionSuccessMsg && (
                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setActiveModalReport(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? 'Updating...' : 'Save & Publish Update'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      {deleteTargetReport && (
        <div className="modal-overlay" onClick={() => setDeleteTargetReport(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#DC2626' }}>
                <AlertTriangle size={20} />
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
                  Confirm Report Deletion
                </h3>
              </div>
              <button
                onClick={() => setDeleteTargetReport(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete report <strong>{deleteTargetReport.report_code}</strong> ({deleteTargetReport.category} at {deleteTargetReport.location})?
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#991B1B', marginTop: '0.5rem' }}>
                This action cannot be undone and will remove all audit history notes.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setDeleteTargetReport(null)}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="btn btn-danger"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
