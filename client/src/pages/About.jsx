import React from 'react';
import { Leaf, Users, CheckCircle2, ShieldCheck, Target, Lightbulb, Compass, Award } from 'lucide-react';

export default function About({ onNavigate }) {
  return (
    <div style={{ padding: '4rem 0', backgroundColor: 'var(--bg-main)', minHeight: '85vh' }}>
      <div className="container-narrow">
        {/* Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--primary)'
          }}>
            About The Initiative
          </span>
          <h1 style={{ fontSize: '2.75rem', color: 'var(--primary-dark)', marginTop: '0.4rem', letterSpacing: '-0.02em' }}>
            Technology for a cleaner campus.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', marginTop: '0.5rem', maxWidth: '600px', margin: '0.5rem auto 0' }}>
            Connecting students, maintenance squads, and university administration to rapidly detect, track, and eliminate environmental issues.
          </p>
        </div>

        {/* Narrative Section */}
        <div className="card" style={{ padding: '2.5rem', marginBottom: '2.5rem', lineHeight: 1.7, fontSize: '1rem', color: 'var(--text-main)' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-dark)', marginBottom: '1rem' }}>
            The Genesis of Green Campus
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Universities are miniature cities, encompassing residential hostels, dining cafeterias, research laboratories,
            sports complexes, and expansive landscaping. Historically, minor maintenance anomalies — such as a concealed drip
            beneath a chemistry sink, empty lecture halls burning high-voltage lighting, or bins overflowing across walkways — often
            went unaddressed for days simply because no friction-free reporting pipeline existed.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong>Green Campus</strong> was conceived by students as a continuous assessment capstone project to bridge this communication gap.
            By providing every student and faculty member with an instant, mobile-ready reporting portal, we transform thousands of campus residents
            into active stewards of their surrounding environment.
          </p>
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            padding: '1.25rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            borderLeft: '4px solid var(--primary)',
            marginTop: '1.5rem'
          }}>
            <p style={{ fontSize: '0.9375rem', color: 'var(--primary-dark)', fontStyle: 'italic', margin: 0 }}>
              “True campus sustainability cannot be sustained solely by custodial staff; it thrives when the entire student body takes collective ownership of the physical ecosystem.”
            </p>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.75rem',
          marginBottom: '3rem'
        }}>
          {/* 1. Our Mission */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Target size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
              Our Mission
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              To deliver an open, transparent, and accountable software platform that reduces university water leakage by 40%,
              eliminates unnecessary electricity run-time, and ensures 100% compliance with zero-waste sorting regulations.
            </p>
          </div>

          {/* 2. How It Helps */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <CheckCircle2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
              How It Helps Facilities
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Instead of relying on random phone complaints or paper logbooks, facility managers receive photographic evidence,
              precise building locations, and automatic severity triage. Dispatched plumbers and electricians log on-site notes directly to the report.
            </p>
          </div>

          {/* 3. Why Student Participation Matters */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Users size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
              Why Student Participation Matters
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Students inhabit dormitories, libraries, and laboratories at all hours. Enabling students to submit verified reports — either with their name
              or anonymously — democratizes maintenance oversight and guarantees that neglected corners receive equal attention.
            </p>
          </div>

          {/* 4. Future Vision */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Lightbulb size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
              Future Vision
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Expanding into IoT smart sensor integration (ultrasonic water flow monitoring and smart kilowatt metering), automated AI image recognition
              to diagnose pipe corrosion, and inter-hostel green sustainability reward leaderboards.
            </p>
          </div>
        </div>

        {/* Academic Project Credits */}
        <div className="card" style={{
          padding: '2rem',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-medium)',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Department of Computer Science & Environmental Studies
          </span>
          <h3 style={{ fontSize: '1.35rem', color: 'var(--primary-dark)', marginTop: '0.35rem', marginBottom: '0.5rem' }}>
            Demonstration Capstone Project
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
            Built using modern full-stack web standards: React, Node.js, Express, SQLite, and Chart.js, designed specifically for university deployment.
          </p>

          <button
            onClick={() => onNavigate('/report')}
            className="btn btn-primary"
          >
            Submit an Environmental Report
          </button>
        </div>
      </div>
    </div>
  );
}
