import React, { useState, useRef, useEffect } from 'react';
import { verifyRecordApi } from '../api/client';
import { ShieldCheck, UploadCloud, File, AlertOctagon, CheckCircle2, ShieldAlert, Copy, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

export default function VerifyPage({ initialRecordId, onNavigate, showToast }) {
  const [recordId, setRecordId] = useState(initialRecordId || '');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialRecordId) {
      setRecordId(initialRecordId);
    }
  }, [initialRecordId]);

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
      setResult(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!recordId.trim()) {
      setError('Please enter a Record ID.');
      return;
    }
    if (!file) {
      setError('Please select or upload a document to verify.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await verifyRecordApi(recordId.trim(), file);
      if (data) {
        setResult(data);
      } else {
        setError('No verification response received from server.');
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
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <ShieldCheck style={{ color: 'var(--accent-light)' }} />
            Verify Document Authenticity
          </h2>
          <p className="card-subtitle">
            Upload your document copy and enter its Record ID to perform cryptographic verification against on-chain blockchain records.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>Verification Request Failed:</strong> {error}
            </div>
          </div>
        )}

        <form onSubmit={handleVerify}>
          {/* Record ID Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="verifyRecordId">
              Record Identifier (ID) *
            </label>
            <input
              id="verifyRecordId"
              type="text"
              className="form-input"
              placeholder="e.g. CERT-STANFORD-2026-001"
              value={recordId}
              onChange={(e) => {
                setRecordId(e.target.value);
                setResult(null);
                setError(null);
              }}
              disabled={loading}
              required
            />
          </div>

          {/* Document Upload Area */}
          <div className="form-group">
            <label className="form-label">
              Document File to Verify *
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
                {file ? 'Change selected file' : 'Click or Drag & Drop candidate document'}
              </div>
              <div className="dropzone-hint">
                Select the file you want to test for tampering or check for integrity
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
                    setResult(null);
                  }}
                  disabled={loading}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading || !recordId.trim() || !file}
          >
            {loading ? (
              <>
                <div className="spinner" />
                Computing SHA-256 & Verifying On-Chain...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                Verify Document Authenticity
              </>
            )}
          </button>
        </form>

        {/* Verification Result Display */}
        {result && (
          <div className={`result-banner ${result.authentic ? 'authentic' : 'tampered'}`}>
            <div className="result-badge">
              {result.authentic ? (
                <>
                  <CheckCircle2 size={24} />
                  ✓ AUTHENTIC / VERIFIED
                </>
              ) : (
                <>
                  <ShieldAlert size={24} />
                  ⚠ TAMPERED / MODIFIED
                </>
              )}
            </div>

            <p className="result-message">
              {result.authentic
                ? 'MATCH CONFIRMED: The SHA-256 digest of this file exactly matches the immutable hash stored on the blockchain.'
                : 'SECURITY ALERT: The SHA-256 hash of the uploaded document does NOT match the registered blockchain record! The file may have been edited, corrupted, or altered.'}
            </p>

            <div className="details-grid" style={{ marginTop: '24px', textAlign: 'left' }}>
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div
                  className="detail-value"
                  style={{
                    color: result.authentic ? 'var(--emerald-main)' : 'var(--red-main)',
                    fontWeight: 800,
                  }}
                >
                  {result.authentic ? 'VERIFIED_UNTAMPERED' : 'TAMPER_DETECTED'}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Record ID</div>
                <div className="detail-value">{result.recordId}</div>
              </div>

              {result.documentHash && (
                <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                  <div className="detail-label">Uploaded File Hash (SHA-256)</div>
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
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                onClick={() => onNavigate('details', result.recordId)}
              >
                <ExternalLink size={16} />
                Inspect Blockchain Metadata
              </button>

              <button className="btn btn-secondary" onClick={resetForm}>
                <RefreshCw size={16} />
                Verify Another Document
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
