import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import ReportIssue from './pages/ReportIssue';
import CommunityReports from './pages/CommunityReports';
import TrackReport from './pages/TrackReport';
import Impact from './pages/Impact';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminReportDetails from './pages/AdminReportDetails';

function AppContent() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));
  const { user, isAdmin } = useAuth();

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setSearchParams(new URLSearchParams(window.location.search));
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    let cleanPath = path;
    let query = '';

    if (path.includes('?')) {
      const parts = path.split('?');
      cleanPath = parts[0];
      query = '?' + parts[1];
    }

    window.history.pushState({}, '', cleanPath + query);
    setCurrentPath(cleanPath);
    setSearchParams(new URLSearchParams(query));
    window.scrollTo(0, 0);
  };

  // Route matching
  let PageComponent = null;

  if (currentPath === '/') {
    PageComponent = <Home onNavigate={navigate} />;
  } else if (currentPath === '/report') {
    PageComponent = <ReportIssue onNavigate={navigate} />;
  } else if (currentPath === '/reports') {
    PageComponent = <CommunityReports onNavigate={navigate} />;
  } else if (currentPath === '/track') {
    const reportCode = searchParams.get('id') || '';
    PageComponent = <TrackReport initialReportCode={reportCode} onNavigate={navigate} />;
  } else if (currentPath === '/impact') {
    PageComponent = <Impact onNavigate={navigate} />;
  } else if (currentPath === '/about') {
    PageComponent = <About onNavigate={navigate} />;
  } else if (currentPath === '/login') {
    PageComponent = <Login onNavigate={navigate} />;
  } else if (currentPath === '/register') {
    PageComponent = <Register onNavigate={navigate} />;
  } else if (currentPath === '/dashboard') {
    PageComponent = <StudentDashboard onNavigate={navigate} />;
  } else if (currentPath === '/admin' || currentPath === '/admin/reports') {
    PageComponent = <AdminDashboard onNavigate={navigate} />;
  } else if (currentPath.startsWith('/admin/reports/')) {
    const reportId = currentPath.replace('/admin/reports/', '');
    PageComponent = <AdminReportDetails reportId={reportId} onNavigate={navigate} />;
  } else {
    // 404 fallback
    PageComponent = (
      <div className="container-narrow" style={{ padding: '6rem 1.5rem', textAlign: 'center', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-subtle)', marginBottom: '2rem' }}>
          The requested page <code style={{ backgroundColor: 'var(--bg-muted)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{currentPath}</code> does not exist.
        </p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar currentPath={currentPath} onNavigate={navigate} />
      <main style={{ flex: 1 }}>
        {PageComponent}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
