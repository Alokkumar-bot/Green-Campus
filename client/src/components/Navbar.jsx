import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Leaf, Menu, X, PlusCircle, User, Shield, LogOut, Compass } from 'lucide-react';

export default function Navbar({ currentPath = '/', onNavigate }) {
  const { user, isAdmin, isStudent, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (path) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Report an Issue', path: '/report' },
    { label: 'Reports', path: '/reports' },
    { label: 'Track', path: '/track' },
    { label: 'Impact', path: '/impact' },
    { label: 'About', path: '/about' }
  ];

  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* Brand Logo */}
          <a 
            href="/" 
            className="brand-link" 
            onClick={(e) => { e.preventDefault(); handleNav('/'); }}
          >
            <div className="brand-logo-mark">
              <Leaf size={22} strokeWidth={2.2} />
            </div>
            <div className="brand-text">
              <span className="brand-title">GREEN CAMPUS</span>
              <span className="brand-tagline">Report. Resolve. Sustain.</span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav>
            <ul className="nav-links">
              {navLinks.map((item) => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    className={`nav-link ${currentPath === item.path ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNav(item.path);
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop Auth Group */}
          <div className="nav-auth-group">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {isAdmin ? (
                  <button
                    onClick={() => handleNav('/admin')}
                    className="btn btn-secondary btn-sm"
                    style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                  >
                    <Shield size={15} />
                    <span>Admin Panel</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNav('/dashboard')}
                    className="btn btn-secondary btn-sm"
                  >
                    <User size={15} />
                    <span>Dashboard</span>
                  </button>
                )}

                <button
                  onClick={() => handleNav('/report')}
                  className="btn btn-primary btn-sm"
                >
                  <PlusCircle size={15} />
                  <span>Report</span>
                </button>

                <button
                  onClick={logout}
                  className="btn btn-secondary btn-sm"
                  title="Sign out"
                  style={{ padding: '0.4rem 0.6rem' }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  onClick={() => handleNav('/admin')}
                  className="btn btn-secondary btn-sm"
                  style={{ borderColor: 'var(--accent)', color: 'var(--primary-dark)', fontSize: '0.8125rem' }}
                  title="Campus Authority & Staff Console"
                >
                  <Shield size={14} color="var(--primary)" />
                  <span>Authority Portal</span>
                </button>
                <button
                  onClick={() => handleNav('/login')}
                  className="btn btn-secondary btn-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNav('/report')}
                  className="btn btn-primary btn-sm"
                >
                  <PlusCircle size={15} />
                  <span>Report an Issue</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        {navLinks.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className={`nav-link ${currentPath === item.path ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleNav(item.path);
            }}
          >
            {item.label}
          </a>
        ))}

        <div className="mobile-nav-auth">
          {user ? (
            <>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Logged in as <strong>{user.name}</strong> ({user.role})
              </div>
              {isAdmin ? (
                <button
                  onClick={() => handleNav('/admin')}
                  className="btn btn-secondary btn-sm"
                >
                  <Shield size={16} /> Admin Dashboard
                </button>
              ) : (
                <button
                  onClick={() => handleNav('/dashboard')}
                  className="btn btn-secondary btn-sm"
                >
                  <User size={16} /> Student Dashboard
                </button>
              )}
              <button
                onClick={() => handleNav('/report')}
                className="btn btn-primary btn-sm"
              >
                <PlusCircle size={16} /> Report an Issue
              </button>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="btn btn-outline btn-sm"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNav('/admin')}
                className="btn btn-secondary btn-sm"
                style={{ borderColor: 'var(--accent)', color: 'var(--primary-dark)' }}
              >
                <Shield size={16} color="var(--primary)" /> Authority & Staff Portal
              </button>
              <button
                onClick={() => handleNav('/login')}
                className="btn btn-secondary btn-sm"
              >
                Student Login
              </button>
              <button
                onClick={() => handleNav('/register')}
                className="btn btn-outline btn-sm"
              >
                Register as Student
              </button>
              <button
                onClick={() => handleNav('/report')}
                className="btn btn-primary btn-sm"
              >
                <PlusCircle size={16} /> Report an Issue
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
