import React from 'react';
import { Leaf, ShieldCheck, ExternalLink } from 'lucide-react';

export default function Footer({ onNavigate }) {
  const handleNav = (path) => {
    if (onNavigate) onNavigate(path);
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Leaf size={18} />
              </div>
              <span className="footer-brand-title">GREEN CAMPUS</span>
            </div>
            <p className="footer-tagline">“Report. Resolve. Sustain.”</p>
            <p className="footer-desc">
              A comprehensive campus sustainability and environmental reporting platform connecting students,
              facilities management, and administration to maintain an ecological, clean, and energy-efficient university.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-col-title">Platform Navigation</h4>
            <ul className="footer-nav">
              <li>
                <a href="/" onClick={(e) => { e.preventDefault(); handleNav('/'); }}>
                  Home
                </a>
              </li>
              <li>
                <a href="/report" onClick={(e) => { e.preventDefault(); handleNav('/report'); }}>
                  Report an Issue
                </a>
              </li>
              <li>
                <a href="/reports" onClick={(e) => { e.preventDefault(); handleNav('/reports'); }}>
                  Community Reports
                </a>
              </li>
              <li>
                <a href="/track" onClick={(e) => { e.preventDefault(); handleNav('/track'); }}>
                  Track Report by ID
                </a>
              </li>
              <li>
                <a href="/impact" onClick={(e) => { e.preventDefault(); handleNav('/impact'); }}>
                  Sustainability Impact
                </a>
              </li>
              <li>
                <a href="/about" onClick={(e) => { e.preventDefault(); handleNav('/about'); }}>
                  About Green Campus
                </a>
              </li>
            </ul>
          </div>

          {/* College Project / Administration */}
          <div>
            <h4 className="footer-col-title">Campus & Governance</h4>
            <ul className="footer-nav">
              <li>
                <a href="/admin" onClick={(e) => { e.preventDefault(); handleNav('/admin'); }}>
                  Admin Portal
                </a>
              </li>
              <li>
                <a href="/login" onClick={(e) => { e.preventDefault(); handleNav('/login'); }}>
                  Staff & Student Login
                </a>
              </li>
              <li>
                <a href="/register" onClick={(e) => { e.preventDefault(); handleNav('/register'); }}>
                  Student Sign Up
                </a>
              </li>
            </ul>
            <div style={{
              marginTop: '1.25rem',
              padding: '0.85rem',
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                <ShieldCheck size={14} /> Academic Project Demonstration
              </span>
              <p style={{ fontSize: '0.75rem', color: '#A0ABA4', marginTop: '0.35rem', lineHeight: 1.4 }}>
                Continuous Assessment Project designed for university estates and sustainability divisions.
              </p>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="footer-bottom">
          <p>Built as an academic project for demonstrating technology-driven campus sustainability.</p>
          <p>© 2026 Green Campus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
