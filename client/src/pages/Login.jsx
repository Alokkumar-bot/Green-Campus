import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Leaf, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.user.role === 'admin') {
        onNavigate('/admin');
      } else {
        onNavigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg('');
  };

  return (
    <div style={{ padding: '4rem 1.5rem', backgroundColor: 'var(--bg-main)', minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
      <div className="container-narrow" style={{ width: '100%', maxWidth: '460px' }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
            boxShadow: '0 2px 6px rgba(31, 93, 66, 0.25)'
          }}>
            <Leaf size={26} />
          </div>
          <h1 style={{ fontSize: '2rem', color: 'var(--primary-dark)', fontWeight: 800 }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Access your student reports or facilities management console.
          </p>
        </div>

        {/* Error Box */}
        {errorMsg && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            color: '#991B1B',
            fontSize: '0.875rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="card" style={{ padding: '2.25rem', boxShadow: 'var(--shadow-md)' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Campus Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. aarav@campus.edu or admin@greencampus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Mail
                  size={16}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Lock
                  size={16}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo Login Quick Fills for Evaluator */}
          <div style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-light)',
            fontSize: '0.8125rem'
          }}>
            <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Demo Credentials (Click to prefill):
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('aarav@campus.edu', 'student123')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'space-between', fontSize: '0.75rem' }}
              >
                <span><strong>Student:</strong> aarav@campus.edu</span>
                <span style={{ color: 'var(--primary)' }}>Fill student</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@greencampus.edu', 'admin123')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'space-between', fontSize: '0.75rem' }}
              >
                <span><strong>Admin:</strong> admin@greencampus.edu</span>
                <span style={{ color: 'var(--primary)' }}>Fill admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Link to Register */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have a student account yet?{' '}
          <a
            href="/register"
            onClick={(e) => { e.preventDefault(); onNavigate('/register'); }}
            style={{ fontWeight: 600, color: 'var(--primary)' }}
          >
            Register as a Student
          </a>
        </div>
      </div>
    </div>
  );
}
