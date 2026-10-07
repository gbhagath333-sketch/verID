import React, { useState, useRef } from 'react';
import { registerRecordApi } from '../api/client';
import { FilePlus, UploadCloud, File, CheckCircle2, AlertCircle, Copy, ExternalLink, RefreshCw } from 'lucide-react';

export default function RegisterPage({ onNavigate, showToast }) {
  const [recordId, setRecordId] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const generateSampleId = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setRecordId(`REC-DOC-2026-${randomSuffix}`);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recordId.trim()) {
      setError('Please enter a valid Record ID.');
      return;
    }
    if (!file) {
      setError('Please select or drag a document file to register.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await registerRecordApi(recordId.trim(), file);
      if (data && data.success) {
        setResult(data);
        showToast('Document registered on blockchain successfully!');
      } else {
        setError(data?.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error connecting to backend server';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  const resetForm = () => {
    setRecordId('');
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <FilePlus style={{ color: 'var(--accent-light)' }} />
            Register Document Record
          </h2>
          <p className="card-subtitle">
            Anchor document authenticity on the blockchain by computing its SHA-256 hash and registering its record.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>Registration Failed:</strong> {error}
            </div>
          </div>
        )}

        {!result ? (
          <form onSubmit={handleSubmit}>
            {/* Record ID Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="recordId">
                Record Identifier (ID) *
              </label>
              <div className="input-with-button">
                <input
                  id="recordId"
                  type="text"
                  className="form-input"
                  placeholder="e.g. CERT-STANFORD-2026-001"
                  value={recordId}
                  onChange={(e) => setRecordId(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={generateSampleId}
                  disabled={loading}
                  title="Generate a sample unique Record ID"
                >
                  Auto Generate
                </button>
              </div>
            </div>

            {/* Document Upload Area */}
            <div className="form-group">
              <label className="form-label">
                Upload Document File *
              </label>

              <div
                className={`dropzone ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  disabled={loading}
                />
                <UploadCloud className="dropzone-icon" />
                <div className="dropzone-text">
                  {file ? 'Change selected document' : 'Click or Drag & Drop document here'}
                </div>
                <div className="dropzone-hint">
                  Supports PDF, DOCX, PNG, JPG, TXT, JSON, or any binary file format
                </div>
              </div>

              {file && (
                <div className="selected-file">
                  <div className="file-info">
                    <File size={20} style={{ color: 'var(--accent-light)', flexShrink: 0 }} />
                    <div>
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading || !recordId.trim() || !file}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Hashing & Registering on Blockchain...
                </>
              ) : (
                <>
                  <FilePlus size={18} />
                  Register Record on Blockchain
                </>
              )}
            </button>
          </form>
        ) : (
          /* Registration Success Result Display */
          <div className="result-banner authentic" style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <CheckCircle2 size={32} style={{ color: 'var(--emerald-main)' }} />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald-main)' }}>
                  Record Successfully Registered!
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Your document fingerprint has been immutably recorded on the blockchain ledger.
                </p>
              </div>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <div className="detail-label">Record ID</div>
                <div className="detail-value copy-row">
                  <span>{result.recordId}</span>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => copyToClipboard(result.recordId, 'Record ID')}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                <div className="detail-label">Document Hash (SHA-256)</div>
                <div className="detail-value mono copy-row">
                  <span style={{ wordBreak: 'break-all' }}>{result.documentHash}</span>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => copyToClipboard(result.documentHash, 'Document Hash')}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                <div className="detail-label">Blockchain Transaction Hash</div>
                <div className="detail-value mono copy-row">
                  <span style={{ wordBreak: 'break-all' }}>{result.transactionHash}</span>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => copyToClipboard(result.transactionHash, 'Transaction Hash')}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => onNavigate('verify', result.recordId)}
              >
                Verify this Record Now
                <ExternalLink size={16} />
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => onNavigate('details', result.recordId)}
              >
                View On-Chain Details
              </button>

              <button className="btn btn-secondary" onClick={resetForm}>
                <RefreshCw size={16} />
                Register Another Document
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
