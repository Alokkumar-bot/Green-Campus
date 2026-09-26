import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { 
  Camera, 
  UploadCloud, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  FileText, 
  Shield, 
  HelpCircle,
  ArrowRight,
  Plus
} from 'lucide-react';

const CATEGORIES = [
  'Water Leakage',
  'Waste / Overflowing Bin',
  'Littering',
  'Electricity Wastage',
  'AC / Appliance Wastage',
  'Green Space / Plants',
  'Waste Segregation',
  'Other'
];

const DEFAULT_LOCATIONS = [
  'Main Gate',
  'Academic Block',
  'Library',
  'Canteen',
  'Hostel Block A',
  'Hostel Block B',
  'Parking Area',
  'Sports Complex',
  'Auditorium',
  'Laboratory Block',
  'Administrative Block',
  'Botanical Garden',
  'Other'
];

export default function ReportIssue({ onNavigate }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [specificArea, setSpecificArea] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [anonymous, setAnonymous] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [locationsList, setLocationsList] = useState(DEFAULT_LOCATIONS);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedData, setSubmittedData] = useState(null);

  useEffect(() => {
    api.getLocations()
      .then(res => {
        if (res.success && res.locations && res.locations.length > 0) {
          const names = res.locations.map(l => l.name);
          if (!names.includes('Other')) names.push('Other');
          setLocationsList(names);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_LOCATIONS
      });
  }, []);

  const handlePhotoSelect = (e) => {
    setErrorMsg('');
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Please upload a JPG, PNG or WEBP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Photo size must be less than 5MB.');
      return;
    }

    setPhoto(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!category) {
      setErrorMsg('Please select an issue category.');
      return;
    }

    const finalLocation = location === 'Other' ? customLocation.trim() : location;
    if (!finalLocation) {
      setErrorMsg('Please select or specify a campus location.');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setErrorMsg('Please describe the issue in detail (at least 10 characters).');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('location', finalLocation);
      if (specificArea.trim()) {
        formData.append('specificArea', specificArea.trim());
      }
      formData.append('description', description.trim());
      formData.append('severity', severity);
      formData.append('anonymous', anonymous ? 'true' : 'false');
      if (photo) {
        formData.append('photo', photo);
      }

      const res = await api.createReport(formData);

      if (res.success) {
        setSubmittedData({
          reportCode: res.reportCode,
          category,
          location: finalLocation,
          severity
        });

        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
      } else {
        setErrorMsg(res.message || 'Failed to submit report. Please try again.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If successfully submitted, render the success confirmation view
  if (submittedData) {
    return (
      <div className="container-narrow" style={{ padding: '4rem 1.5rem' }}>
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <CheckCircle2 size={36} strokeWidth={2.5} />
          </div>

          <h2 style={{ fontSize: '2rem', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
            Report Submitted Successfully
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
            Thank you for helping us maintain a greener, cleaner, and more sustainable campus.
          </p>

          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            maxWidth: '420px',
            margin: '0 auto 2rem',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Your Unique Tracking Code
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--primary)',
              margin: '0.25rem 0 0.75rem'
            }}>
              {submittedData.reportCode}
            </div>

            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div><strong>Category:</strong> {submittedData.category}</div>
              <div><strong>Location:</strong> {submittedData.location}</div>
              <div><strong>Severity:</strong> {submittedData.severity}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate(`/track?id=${submittedData.reportCode}`)}
              className="btn btn-primary btn-lg"
            >
              <span>View Report Status</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => {
                setSubmittedData(null);
                setCategory('');
                setLocation('');
                setCustomLocation('');
                setSpecificArea('');
                setDescription('');
                setSeverity('Medium');
                setAnonymous(false);
                setPhoto(null);
                setPhotoPreview(null);
              }}
              className="btn btn-secondary btn-lg"
            >
              <Plus size={18} />
              <span>Submit Another Report</span>
            </button>
          </div>

          {/* Authority Quick Review Callout */}
          <div style={{
            marginTop: '2.5rem',
            paddingTop: '1.75rem',
            borderTop: '1px solid var(--border-light)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8125rem',
              color: 'var(--primary)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.35rem'
            }}>
              <Shield size={15} /> Campus Authority & Facilities Triage
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 1rem' }}>
              Are you maintenance personnel or a facilities administrator? You can review this report, assign maintenance squads, and advance its progress right now.
            </p>
            <button
              onClick={() => onNavigate(`/track?id=${submittedData.reportCode}`)}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.45rem 1rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
            >
              <Shield size={14} />
              <span>Open Authority Review & Progress Section</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '3.5rem 0', backgroundColor: 'var(--bg-main)' }}>
      <div className="container-narrow">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--primary)'
          }}>
            Campus Environmental Helpdesk
          </span>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-dark)', marginTop: '0.35rem' }}>
            Report an Environmental Issue
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.35rem' }}>
            Document water wastage, overflowing bins, unsegregated trash, or energy overuse.
            Our facilities team will triage and dispatch support.
          </p>
        </div>

        {/* Error notification banner if any */}
        {errorMsg && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#991B1B'
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{errorMsg}</span>
          </div>
        )}

        {/* The Form */}
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
          {/* 1. Category */}
          <div className="form-group">
            <label className="form-label">
              Issue Category <span className="required">*</span>
            </label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select Category...</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <span className="form-hint">Choose the area that best classifies the observation.</span>
          </div>

          {/* 2. Campus Location */}
          <div className="form-group">
            <label className="form-label">
              Campus Location <span className="required">*</span>
            </label>
            <select
              className="form-select"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            >
              <option value="">Select Campus Location...</option>
              {locationsList.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {location === 'Other' && (
            <div className="form-group" style={{ marginTop: '-0.5rem' }}>
              <label className="form-label">
                Specify Location Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Mechanical Workshop Courtyard, North Pergola"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                required
              />
            </div>
          )}

          {/* Specific Area / Floor / Landmark */}
          <div className="form-group">
            <label className="form-label">
              Specific Room, Floor, or Landmark
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 2nd Floor Men's Restroom, Behind Table 4 in Canteen"
              value={specificArea}
              onChange={(e) => setSpecificArea(e.target.value)}
            />
            <span className="form-hint">Helps the maintenance squad pinpoint the problem faster.</span>
          </div>

          {/* 3. Description */}
          <div className="form-group">
            <label className="form-label">
              Problem Description <span className="required">*</span>
            </label>
            <textarea
              className="form-textarea"
              placeholder="Describe what you observed (e.g. constant drip from faucet valve, lights left on during morning classes)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* 4. Severity */}
          <div className="form-group">
            <label className="form-label">
              Urgency / Severity Level
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '0.25rem' }}>
              {[
                { val: 'Low', label: 'Low', desc: 'Minor issue / aesthetic' },
                { val: 'Medium', label: 'Medium', desc: 'Resource loss / standard' },
                { val: 'High', label: 'High', desc: 'Hazardous / severe wastage' }
              ].map(item => (
                <label
                  key={item.val}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0.85rem 1rem',
                    border: severity === item.val ? '2px solid var(--primary)' : '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: severity === item.val ? 'var(--primary-subtle)' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <input
                      type="radio"
                      name="severity"
                      value={item.val}
                      checked={severity === item.val}
                      onChange={(e) => setSeverity(e.target.value)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--primary-dark)' }}>{item.label}</strong>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 5. Upload Evidence (JPG, PNG, WEBP) */}
          <div className="form-group" style={{ margin: '1.75rem 0' }}>
            <label className="form-label">
              Upload Photographic Evidence (Recommended)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoSelect}
              style={{ display: 'none' }}
              id="report-photo-input"
            />

            {!photoPreview ? (
              <label
                htmlFor="report-photo-input"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2.5rem 1.5rem',
                  border: '2px dashed var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-subtle)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                  boxShadow: 'var(--shadow-xs)'
                }}>
                  <Camera size={22} />
                </div>
                <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--primary-dark)' }}>
                  Click to select photo or take picture
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
                  Supports JPG, PNG, WEBP up to 5MB
                </span>
              </label>
            ) : (
              <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border-medium)',
                maxHeight: '260px'
              }}>
                <img
                  src={photoPreview}
                  alt="Evidence preview"
                  style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }}
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="btn btn-danger btn-sm"
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  <X size={14} /> Remove Photo
                </button>
              </div>
            )}
          </div>

          {/* 6. Anonymous Report Option */}
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem',
            border: '1px solid var(--border-light)'
          }}>
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
              />
              <span style={{ fontWeight: 600 }}>Submit this report anonymously</span>
            </label>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginLeft: '1.65rem' }}>
              Your student identity and profile will not be shown on public community boards or notifications.
            </p>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting}
              style={{ minWidth: '180px' }}
            >
              {submitting ? (
                <span>Submitting Report...</span>
              ) : (
                <>
                  <span>Submit Report</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
