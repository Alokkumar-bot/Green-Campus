import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  User, 
  ExternalLink, 
  RefreshCw,
  AlertCircle,
  Shield
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

const STATUSES = [
  'All',
  'Pending',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved'
];

export default function CommunityReports({ onNavigate }) {
  const { isAdmin } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, pages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [location, setLocation] = useState('All');
  const [locationsList, setLocationsList] = useState(['All']);

  useEffect(() => {
    api.getLocations().then(res => {
      if (res.success && res.locations) {
        setLocationsList(['All', ...res.locations.map(l => l.name)]);
      }
    }).catch(() => {});
  }, []);

  const loadReports = (pageNumber = 1) => {
    setLoading(true);
    api.getReports({
      category,
      status,
      location,
      search,
      page: pageNumber,
      limit: 12
    })
      .then(res => {
        if (res.success) {
          setReports(res.reports);
          setPagination(res.pagination);
        }
      })
      .catch(err => {
        console.error('Failed to load reports:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadReports(1);
  }, [category, status, location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadReports(1);
  };

  const formatTimeAgo = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHrs / 24);

      if (diffDays > 0) {
        return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
      }
      if (diffHrs > 0) {
        return diffHrs === 1 ? '1 hour ago' : `${diffHrs} hours ago`;
      }
      return 'Just now';
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ padding: '3.5rem 0', backgroundColor: 'var(--bg-main)', minHeight: '80vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--primary)'
          }}>
            Campus Collective Action
          </span>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-dark)', marginTop: '0.35rem' }}>
            Community Reports & Issues
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '0.35rem', maxWidth: '640px' }}>
            Real-time public feed of sustainability observations filed by university students, staff, and faculty.
          </p>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', boxShadow: 'var(--shadow-xs)' }}>
          <form onSubmit={handleSearchSubmit} style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
            gap: '1rem',
            alignItems: 'center'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by ID, keyword, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.25rem' }}
              />
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}
              />
            </div>

            {/* Category Select */}
            <div>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Select */}
            <div>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUSES.map(st => (
                  <option key={st} value={st}>
                    {st === 'All' ? 'All Statuses' : st}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Select */}
            <div>
              <select
                className="form-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                {locationsList.map(loc => (
                  <option key={loc} value={loc}>
                    {loc === 'All' ? 'All Locations' : loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit / Reset Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" title="Search">
                <Search size={16} />
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                title="Reset filters"
                onClick={() => {
                  setSearch('');
                  setCategory('All');
                  setStatus('All');
                  setLocation('All');
                }}
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* Results Info */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Showing <strong>{reports.length}</strong> of <strong>{pagination.total}</strong> community reports
          </span>

          <button
            onClick={() => onNavigate('/report')}
            className="btn btn-primary btn-sm"
          >
            + Report New Issue
          </button>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading campus reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <AlertCircle size={40} style={{ color: 'var(--text-subtle)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
              No reports match your filters
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
              Try adjusting your search query, or clear status and category filters to see all campus reports.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setCategory('All');
                setStatus('All');
                setLocation('All');
              }}
              className="btn btn-secondary"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem'
          }}>
            {reports.map((r) => (
              <div key={r.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Photo if present */}
                {r.image_url ? (
                  <div style={{ height: '190px', overflow: 'hidden', borderTopLeftRadius: 'var(--radius-md)', borderTopRightRadius: 'var(--radius-md)', position: 'relative' }}>
                    <img
                      src={r.image_url}
                      alt={r.category}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                      <SeverityBadge severity={r.severity} />
                    </div>
                  </div>
                ) : (
                  <div style={{
                    height: '110px',
                    backgroundColor: 'var(--primary-subtle)',
                    borderTopLeftRadius: 'var(--radius-md)',
                    borderTopRightRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem'
                  }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                      {r.category}
                    </span>
                    <SeverityBadge severity={r.severity} />
                  </div>
                )}

                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: 'var(--text-subtle)'
                    }}>
                      {r.report_code}
                    </span>
                    <StatusBadge status={r.status} />
                  </div>

                  <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-dark)', marginBottom: '0.4rem', fontWeight: 700 }}>
                    {r.category}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    <MapPin size={13} color="var(--primary)" />
                    <strong>{r.location}</strong>
                    {r.specific_area && <span>— {r.specific_area}</span>}
                  </div>

                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-main)',
                    lineHeight: 1.5,
                    marginBottom: '1.25rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {r.description}
                  </p>

                  <div style={{
                    marginTop: 'auto',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={12} />
                        {formatTimeAgo(r.created_at)}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        By: {r.reporter_name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      {isAdmin ? (
                        <button
                          onClick={() => onNavigate(`/track?id=${r.report_code}`)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          title="Open Authority Progress Controls"
                        >
                          <Shield size={12} />
                          <span>Review & Progress</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigate(`/track?id=${r.report_code}`)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderColor: 'var(--border-medium)' }}
                          title="Authority & Staff Review"
                        >
                          <Shield size={12} />
                          <span>Authority Review</span>
                        </button>
                      )}

                      <button
                        onClick={() => onNavigate(`/track?id=${r.report_code}`)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      >
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
            <button
              onClick={() => loadReports(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="btn btn-secondary btn-sm"
            >
              Previous
            </button>
            <span style={{ fontSize: '0.875rem', padding: '0 0.75rem', color: 'var(--text-muted)' }}>
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => loadReports(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="btn btn-secondary btn-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
