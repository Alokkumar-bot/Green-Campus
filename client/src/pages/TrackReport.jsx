import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Timeline from '../components/Timeline';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import { 
  Search, 
  MapPin, 
  Calendar, 
  User, 
  Shield, 
  Wrench, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Share2,
  Lock,
  Mail,
  Edit3,
  Send,
  Sparkles,
  LogOut,
  Check
} from 'lucide-react';

const SQUADS = [
  'Campus Plumbing Squad',
  'Campus Electrical Squad',
  'Sanitation Services',
  'Horticulture & Grounds',
  'Estate Management Division',
  'Sustainability Office'
];

export default function TrackReport({ initialReportCode = '', onNavigate }) {
  const { user, isAdmin, login, logout } = useAuth();

  const [searchCode, setSearchCode] = useState(initialReportCode);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Authority inline update states
  const [authorityStatus, setAuthorityStatus] = useState('In Progress');
  const [authoritySquad, setAuthoritySquad] = useState(SQUADS[0]);
  const [authorityNote, setAuthorityNote] = useState('');
  const [updatingAuthority, setUpdatingAuthority] = useState(false);
  const [authoritySuccessNotice, setAuthoritySuccessNotice] = useState('');
  const [authorityErrorNotice, setAuthorityErrorNotice] = useState('');

  // Inline Admin Login states (if not already logged in as admin)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');

  const fetchReport = async (codeToSearch) => {
    if (!codeToSearch || !codeToSearch.trim()) {
      setErrorMsg('Please enter a valid Report ID (e.g., GC-2026-00482).');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.getReportByCode(codeToSearch.trim());
      if (res.success && res.report) {
        setReport(res.report);
        setAuthorityStatus(res.report.status);
        setAuthoritySquad(res.report.assigned_to || SQUADS[0]);
      } else {
        setReport(null);
        setErrorMsg(res.message || 'Report not found.');
      }
    } catch (err) {
      setReport(null);
      setErrorMsg(err.message || 'Unable to find report. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialReportCode) {
      setSearchCode(initialReportCode);
      fetchReport(initialReportCode);
    }
  }, [initialReportCode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReport(searchCode);
  };

  const copyReportLink = () => {
    if (!report) return;
    const url = `${window.location.origin}/track?id=${report.report_code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Authority Status Progress Commit
  const handleAuthorityUpdate = async (e) => {
    e.preventDefault();
    if (!report) return;

    setUpdatingAuthority(true);
    setAuthoritySuccessNotice('');
    setAuthorityErrorNotice('');

    try {
      const res = await api.updateReportStatus(report.report_code, {
        status: authorityStatus,
        assignedTo: authoritySquad,
        note: authorityNote.trim() || `Status updated to ${authorityStatus} by campus authority.`
      });

      if (res.success && res.report) {
        setReport(res.report);
        setAuthorityNote('');
        setAuthoritySuccessNotice(`Progress successfully updated: Marked as "${authorityStatus}" and logged in timeline!`);
        setTimeout(() => setAuthoritySuccessNotice(''), 5000);
      } else {
        setAuthorityErrorNotice(res.message || 'Failed to update report progress.');
      }
    } catch (err) {
      setAuthorityErrorNotice(err.message || 'Failed to update report. Authority authorization required.');
    } finally {
      setUpdatingAuthority(false);
    }
  };

  // Inline Admin Login Submit
  const handleInlineAdminLogin = async (e) => {
    e.preventDefault();
    setAdminLoginError('');

    if (!adminEmail || !adminPassword) {
      setAdminLoginError('Please enter administrator email and password.');
      return;
    }

    setAdminLoginLoading(true);

    try {
      const res = await login(adminEmail, adminPassword);
      if (res.user.role !== 'admin') {
        setAdminLoginError('This account does not have campus administrator / authority privileges.');
      } else {
        // Successfully logged in as admin right on this page!
        setAdminEmail('');
        setAdminPassword('');
      }
    } catch (err) {
      setAdminLoginError(err.message || 'Admin authentication failed.');
    } finally {
      setAdminLoginLoading(false);
    }
  };

  const handlePrefillAdmin = () => {
    setAdminEmail('admin@greencampus.edu');
    setAdminPassword('admin123');
    setAdminLoginError('');
  };

  return (
    <div style={{ padding: '3.5rem 0', backgroundColor: 'var(--bg-main)', minHeight: '85vh' }}>
      <div className="container-narrow">
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--primary)'
          }}>
            Real-Time Resolution Auditing
          </span>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-dark)', marginTop: '0.35rem' }}>
            Track Report & Authority Review
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.35rem' }}>
            Enter a Report ID to audit maintenance progress, or log in as a campus authority to advance resolution.
          </p>
        </div>

        {/* Search Bar */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter Report ID (e.g. GC-2026-00482)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                style={{ paddingLeft: '2.5rem', fontFamily: 'monospace', textTransform: 'uppercase', fontWeight: 600 }}
              />
              <Search
                size={18}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: '130px' }}
            >
              {loading ? 'Searching...' : 'Track Issue'}
            </button>
          </form>

          {/* Quick example tags */}
          <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
            <span>Quick demo codes:</span>
            {['GC-2026-00483', 'GC-2026-00482', 'GC-2026-00481', 'GC-2026-00479'].map(demo => (
              <button
                key={demo}
                type="button"
                onClick={() => {
                  setSearchCode(demo);
                  fetchReport(demo);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontFamily: 'monospace'
                }}
              >
                {demo}
              </button>
            ))}
          </div>
        </div>

        {/* Error notification if search fails */}
        {errorMsg && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#991B1B'
          }}>
            <AlertCircle size={22} style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block', fontSize: '0.9375rem' }}>Report Not Found</strong>
              <span style={{ fontSize: '0.875rem' }}>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Report Card Details */}
        {report && (
          <>
            <div className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-md)', marginBottom: '2rem' }}>
              {/* Top Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-light)',
                paddingBottom: '1.5rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--primary)'
                  }}>
                    {report.report_code}
                  </span>
                  <h2 style={{ fontSize: '1.75rem', color: 'var(--primary-dark)', marginTop: '0.25rem' }}>
                    {report.category}
                  </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <StatusBadge status={report.status} />
                  <SeverityBadge severity={report.severity} />
                  <button
                    onClick={copyReportLink}
                    className="btn btn-secondary btn-sm"
                    title="Copy tracking link"
                  >
                    <Share2 size={14} />
                    <span>{copied ? 'Link Copied!' : 'Share'}</span>
                  </button>
                </div>
              </div>

              {/* Meta Information Bar */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1.25rem',
                backgroundColor: 'var(--bg-subtle)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '2rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={13} color="var(--primary)" /> Campus Location
                  </span>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--primary-dark)', display: 'block', marginTop: '0.2rem' }}>
                    {report.location}
                  </strong>
                  {report.specific_area && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {report.specific_area}
                    </span>
                  )}
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={13} /> Reported Date & Time
                  </span>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--primary-dark)', display: 'block', marginTop: '0.2rem' }}>
                    {new Date(report.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </strong>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {new Date(report.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Wrench size={13} /> Assigned Squad
                  </span>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--primary-dark)', display: 'block', marginTop: '0.2rem' }}>
                    {report.assigned_to || 'Pending Squad Assignment'}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <User size={13} /> Reporter
                  </span>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--primary-dark)', display: 'block', marginTop: '0.2rem' }}>
                    {report.reporter_name}
                  </strong>
                  {report.reporter_department && report.reporter_department !== 'Hidden' && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {report.reporter_department}
                    </span>
                  )}
                </div>
              </div>

              {/* Description & Photo */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
                  Description
                </h4>
                <p style={{
                  fontSize: '0.9375rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.6,
                  backgroundColor: '#FFFFFF',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)'
                }}>
                  {report.description}
                </p>

                {/* Uploaded photo */}
                {report.image_url && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
                      Uploaded Photographic Evidence
                    </h4>
                    <div style={{
                      maxHeight: '340px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: '1px solid var(--border-medium)',
                      backgroundColor: '#000000'
                    }}>
                      <img
                        src={report.image_url}
                        alt={`Evidence for ${report.report_code}`}
                        style={{ width: '100%', height: '320px', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Timeline */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '2rem' }}>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
                  Resolution Progress Timeline
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Track every stage from student filing to facilities inspection and final remediation.
                </p>

                <Timeline currentStatus={report.status} updates={report.updates || []} />
              </div>
            </div>

            {/* ============================================================== */}
            {/* AUTHORITY REVIEW & REPORT PROGRESS MANAGEMENT SECTION         */}
            {/* ============================================================== */}
            <div className="card" style={{
              padding: '2rem',
              boxShadow: 'var(--shadow-md)',
              border: isAdmin ? '2px solid var(--primary)' : '1px solid var(--border-medium)',
              backgroundColor: isAdmin ? '#FAFBF9' : '#FFFFFF'
            }}>
              {/* Section Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-light)',
                paddingBottom: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: isAdmin ? 'var(--primary)' : '#FEF3C7',
                    color: isAdmin ? '#FFFFFF' : '#B45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', margin: 0 }}>
                      Authority & Maintenance Review Section
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                      Triage issue, assign maintenance squad, and advance report progress.
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-assigned" style={{ fontSize: '0.75rem' }}>
                      <Check size={12} /> Logged in: {user?.name}
                    </span>
                    <button
                      onClick={logout}
                      className="btn btn-outline btn-sm"
                      title="Sign out of admin session"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      <LogOut size={12} /> Sign out
                    </button>
                  </div>
                )}
              </div>

              {/* Feedback Notices */}
              {authoritySuccessNotice && (
                <div style={{
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #6EE7B7',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  color: '#065F46',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem'
                }}>
                  <CheckCircle2 size={18} />
                  <span style={{ fontWeight: 600 }}>{authoritySuccessNotice}</span>
                </div>
              )}

              {authorityErrorNotice && (
                <div style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  color: '#991B1B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem'
                }}>
                  <AlertCircle size={18} />
                  <span>{authorityErrorNotice}</span>
                </div>
              )}

              {/* CASE 1: USER IS LOGGED IN AS ADMIN -> DIRECT PROGRESS CONTROLS */}
              {isAdmin ? (
                <form onSubmit={handleAuthorityUpdate}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                    {/* Status Advance Selector */}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Edit3 size={14} color="var(--primary)" />
                        Advance Report Status <span className="required">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={authorityStatus}
                        onChange={(e) => setAuthorityStatus(e.target.value)}
                        required
                      >
                        <option value="Pending">1. Pending (Awaiting Triage)</option>
                        <option value="Under Review">2. Under Review (Evaluating Urgency)</option>
                        <option value="Assigned">3. Assigned (Squad Dispatched)</option>
                        <option value="In Progress">4. In Progress (Technician On-Site)</option>
                        <option value="Resolved">5. Resolved (Remediation Complete)</option>
                      </select>
                      <span className="form-hint">
                        Current recorded status: <strong>{report.status}</strong>
                      </span>
                    </div>

                    {/* Squad Assignment Selector */}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Wrench size={14} color="var(--primary)" />
                        Assign Maintenance Squad <span className="required">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={authoritySquad}
                        onChange={(e) => setAuthoritySquad(e.target.value)}
                        required
                      >
                        {SQUADS.map(sq => (
                          <option key={sq} value={sq}>{sq}</option>
                        ))}
                      </select>
                      <span className="form-hint">
                        Assigned team will receive work order notifications.
                      </span>
                    </div>
                  </div>

                  {/* Resolution Notes Input */}
                  <div className="form-group">
                    <label className="form-label">
                      Official Progress & Resolution Notes <span className="required">*</span>
                    </label>
                    <textarea
                      className="form-textarea"
                      placeholder="e.g. Facilities squad dispatched. Inspected faucet valve, replaced washer and tightened packing nut. Leak fully halted."
                      value={authorityNote}
                      onChange={(e) => setAuthorityNote(e.target.value)}
                      required
                      style={{ minHeight: '90px' }}
                    />
                    <span className="form-hint">
                      This entry is signed with your administrator credentials and added to the public resolution audit timeline.
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '1.25rem' }}>
                    <button
                      type="button"
                      onClick={() => onNavigate(`/admin/reports/${report.id}`)}
                      className="btn btn-secondary btn-sm"
                    >
                      Open Full Admin Console
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={updatingAuthority}
                      style={{ minWidth: '220px' }}
                    >
                      {updatingAuthority ? (
                        <span>Committing Update...</span>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Commit Progress Update</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* CASE 2: USER IS NOT LOGGED IN AS ADMIN -> INLINE AUTHORITY LOGIN */
                <div>
                  <div style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    border: '1px solid var(--border-light)'
                  }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--primary-dark)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Lock size={16} color="var(--primary)" />
                      Authorized Authority Login Required
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                      Only authorized university facilities personnel, estate engineers, and sustainability administrators can advance the report status and log official maintenance notes.
                    </p>
                  </div>

                  {adminLoginError && (
                    <div style={{
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem',
                      marginBottom: '1.25rem',
                      color: '#991B1B',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <AlertCircle size={16} />
                      <span>{adminLoginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleInlineAdminLogin} style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    alignItems: 'end'
                  }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8125rem' }}>
                        Authority Email Address
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="email"
                          className="form-input"
                          placeholder="e.g. admin@greencampus.edu"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          style={{ paddingLeft: '2.25rem', fontSize: '0.875rem' }}
                          required
                        />
                        <Mail
                          size={14}
                          style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8125rem' }}>
                        Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="password"
                          className="form-input"
                          placeholder="Enter admin password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          style={{ paddingLeft: '2.25rem', fontSize: '0.875rem' }}
                          required
                        />
                        <Lock
                          size={14}
                          style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}
                        />
                      </div>
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={adminLoginLoading}
                        style={{ width: '100%', height: '42px' }}
                      >
                        {adminLoginLoading ? 'Verifying...' : 'Sign In as Authority'}
                      </button>
                    </div>
                  </form>

                  {/* Quick Fill Button for Evaluators */}
                  <div style={{
                    marginTop: '1.25rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                      Testing as evaluator or faculty?
                    </span>
                    <button
                      type="button"
                      onClick={handlePrefillAdmin}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.8125rem' }}
                    >
                      <Sparkles size={14} color="var(--primary)" />
                      <span>Quick Fill Admin Credentials (admin@greencampus.edu)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
