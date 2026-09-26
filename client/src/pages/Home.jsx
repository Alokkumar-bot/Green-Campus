import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import StatsStrip from '../components/StatsStrip';
import StatusBadge from '../components/StatusBadge';
import { 
  Droplets, 
  Trash2, 
  Zap, 
  Sprout, 
  AlertTriangle, 
  ArrowRight, 
  Search, 
  FileText, 
  Users, 
  CheckCircle, 
  MapPin, 
  Clock, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function Home({ onNavigate }) {
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getReports({ limit: 3 })
      .then(res => {
        if (isMounted && res.success) {
          setRecentReports(res.reports);
        }
      })
      .catch(err => {
        console.warn('Recent reports fetch error:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const categories = [
    {
      title: 'Water Management',
      icon: Droplets,
      color: '#0284C7',
      items: ['Pipe & faucet leakage', 'Restroom overflowing', 'Irrigation runoff', 'Cooler drain clogging']
    },
    {
      title: 'Waste & Recycling',
      icon: Trash2,
      color: '#16A34A',
      items: ['Overflowing dustbins', 'Littering in courtyards', 'Improper segregation', 'E-waste accumulation']
    },
    {
      title: 'Energy Conservation',
      icon: Zap,
      color: '#D97706',
      items: ['Empty hall lights left on', 'Unnecessary AC usage', 'Appliance wastage', 'Corridor sensor faults']
    },
    {
      title: 'Green Spaces & Flora',
      icon: Sprout,
      color: '#059669',
      items: ['Damaged tree branches', 'Trampled lawn hedges', 'Under-watered saplings', 'Botanical soil erosion']
    },
    {
      title: 'Other Campus Issues',
      icon: AlertTriangle,
      color: '#7C3AED',
      items: ['Hazardous storage', 'Noise disturbance', 'Exhaust emissions', 'Pavement obstructions']
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Spot',
      desc: 'Notice an environmental problem or resource waste anywhere across the campus grounds.',
      icon: Search
    },
    {
      number: '02',
      title: 'Report',
      desc: 'Upload a quick photo, select the exact campus location, and add a brief description.',
      icon: FileText
    },
    {
      number: '03',
      title: 'Respond',
      desc: 'Facilities management and dedicated squads (plumbing, electrical, grounds) are dispatched.',
      icon: Users
    },
    {
      number: '04',
      title: 'Resolve',
      desc: 'The issue is remediated, verified, marked resolved, and added to the public impact tally.',
      icon: CheckCircle
    }
  ];

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            {/* Left Content */}
            <div>
              <div className="hero-tag">
                <Sparkles size={14} /> University Sustainability Initiative
              </div>
              <h1 className="hero-title">
                Make our campus greener, one report at a time.
              </h1>
              <p className="hero-subtitle">
                Spot an environmental issue on campus? Report it in seconds and help the campus community take action.
                Together we maintain clean grounds, conserve water, and stop energy wastage.
              </p>
              <div className="hero-actions">
                <button
                  onClick={() => onNavigate('/report')}
                  className="btn btn-primary btn-lg"
                >
                  <span>Report an Issue</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={() => onNavigate('/impact')}
                  className="btn btn-secondary btn-lg"
                >
                  Explore Impact
                </button>
              </div>
            </div>

            {/* Right Visual Card */}
            <div>
              <div className="hero-visual-card">
                <img
                  src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1000&q=80"
                  alt="Modern university campus park with trees and solar infrastructure"
                  className="hero-visual-img"
                />
                <div className="hero-visual-badge">
                  <div>
                    <h5 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                      Campus Green Care Network
                    </h5>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Fast-response maintenance for all 12 campus sectors
                    </p>
                  </div>
                  <span className="badge badge-progress" style={{ padding: '0.35rem 0.65rem' }}>
                    Active 24/7
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live Database Statistics Strip */}
      <StatsStrip />

      {/* 3. How It Works Section */}
      <section style={{ padding: '5rem 0', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <span style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--primary)'
            }}>
              Simple 4-Step Process
            </span>
            <h2 style={{ fontSize: '2.25rem', marginTop: '0.4rem', color: 'var(--primary-dark)' }}>
              See something? Report it.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.5rem' }}>
              From initial sighting to permanent resolution, our transparent tracking keeps everyone accountable.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem'
          }}>
            {steps.map((s) => {
              const StepIcon = s.icon;
              return (
                <div key={s.number} className="step-item card-hover">
                  <span className="step-num">{s.number}</span>
                  <div className="step-icon-wrap">
                    <StepIcon size={22} />
                  </div>
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-desc">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Environmental Categories Section */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <span style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--primary)'
            }}>
              Areas of Action
            </span>
            <h2 style={{ fontSize: '2.25rem', marginTop: '0.4rem', color: 'var(--primary-dark)' }}>
              Environmental Categories
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.5rem' }}>
              Select from key problem areas monitored by campus facilities teams.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1.25rem'
          }}>
            {categories.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <div key={cat.title} className="category-card">
                  <div className="category-icon-box">
                    <CatIcon size={24} />
                  </div>
                  <h3 className="category-title">{cat.title}</h3>
                  <ul className="category-items">
                    {cat.items.map((item, idx) => (
                      <li key={idx} className="category-item">{item}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Recent Community Reports Preview */}
      <section style={{ padding: '5rem 0', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--primary)'
              }}>
                Live Transparency
              </span>
              <h2 style={{ fontSize: '2.25rem', marginTop: '0.4rem', color: 'var(--primary-dark)' }}>
                Recent Campus Reports
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
                Latest issues logged and acted on by our student and staff community.
              </p>
            </div>

            <button
              onClick={() => onNavigate('/reports')}
              className="btn btn-secondary"
            >
              <span>View All Reports</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-subtle)' }}>
              Loading recent community reports...
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {recentReports.map((r) => (
                <div key={r.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
                  {r.image_url && (
                    <div style={{ height: '180px', overflow: 'hidden', borderTopLeftRadius: 'var(--radius-md)', borderTopRightRadius: 'var(--radius-md)' }}>
                      <img
                        src={r.image_url}
                        alt={r.category}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', fontFamily: 'monospace' }}>
                        {r.report_code}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>

                    <h4 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
                      {r.category}
                    </h4>

                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-muted)',
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {r.description}
                    </p>

                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        <MapPin size={14} color="var(--primary)" />
                        {r.location}
                      </span>

                      <button
                        onClick={() => onNavigate(`/track?id=${r.report_code}`)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.3rem 0.65rem' }}
                      >
                        Track Status
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section style={{
        padding: '4.5rem 0',
        backgroundColor: 'var(--primary-dark)',
        color: '#FFFFFF'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '720px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '2.35rem', marginBottom: '1rem' }}>
            Empower your campus with actionable reports
          </h2>
          <p style={{ color: '#D2DED6', fontSize: '1.0625rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Whether it’s a dripping faucet in the science library or an overflowing bin outside the cafeteria,
            your single report initiates direct response from campus maintenance.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('/report')}
              className="btn btn-primary btn-lg"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--primary-dark)' }}
            >
              Report an Issue Now
            </button>
            <button
              onClick={() => onNavigate('/track')}
              className="btn btn-secondary btn-lg"
              style={{ backgroundColor: 'transparent', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)' }}
            >
              Track an Existing Report
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
