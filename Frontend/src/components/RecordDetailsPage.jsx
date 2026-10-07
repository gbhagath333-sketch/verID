import React, { useState, useEffect } from 'react';
import { getRecordDetailsApi } from '../api/client';
import { Search, Database, Copy, AlertCircle, Calendar, User, Hash, ExternalLink } from 'lucide-react';

export default function RecordDetailsPage({ initialRecordId, onNavigate, showToast }) {
  const [searchId, setSearchId] = useState(initialRecordId || '');
  const [recordData, setRecordData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialRecordId) {
      setSearchId(initialRecordId);
      fetchDetails(initialRecordId);
    }
  }, [initialRecordId]);

  const fetchDetails = async (idToFetch) => {
    const id = idToFetch || searchId;
    if (!id.trim()) {
      setError('Please enter a Record ID to search.');
      return;
    }

    setLoading(true);
    setError(null);
    setRecordData(null);
    setSearched(true);

    try {
      const data = await getRecordDetailsApi(id.trim());
      if (data && data.success) {
        setRecordData(data);
      } else {
        setError(data?.error || 'Record ID not found on blockchain.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error fetching record from backend';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDetails();
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    // Backend returns timestamp in seconds
    const num = Number(ts);
    if (isNaN(num)) return ts;
    const date = new Date(num * 1000);
    return `${date.toUTCString()} (${date.toLocaleString()})`;
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Database style={{ color: 'var(--accent-light)' }} />
            On-Chain Record Details
          </h2>
          <p className="card-subtitle">
            Query the smart contract state directly via the backend API to inspect registered document metadata.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ marginBottom: '32px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="recordSearchId">
              Lookup Record ID
            </label>
            <div className="input-with-button">
              <input
                id="recordSearchId"
                type="text"
                className="form-input"
                placeholder="Enter Record ID (e.g. CERT-STANFORD-2026-001)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !searchId.trim()}
              >
                {loading ? (
                  <div className="spinner" />
                ) : (
                  <>
                    <Search size={16} />
                    Lookup
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-warning">
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>Record Query Notice:</strong> {error}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px', width: '32px', height: '32px' }} />
            <p>Fetching on-chain record data from backend...</p>
          </div>
        )}

        {/* Empty State when no search executed yet */}
        {!loading && !recordData && !error && !searched && (
          <div style={{ textTransform: 'none', textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Database size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p style={{ fontSize: '1rem', fontWeight: 500 }}>Enter a Record ID above to inspect its blockchain record details.</p>
          </div>
        )}

        {/* Record Data Result Card */}
        {recordData && (
          <div className="card" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', background: 'var(--emerald-bg)', border: '1px solid var(--emerald-border)', borderRadius: 'var(--radius-sm)', color: 'var(--emerald-main)' }}>
                  <Database size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Record ID Found</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--emerald-main)', fontWeight: 600 }}>
                    Active On Blockchain Ledger
                  </span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => onNavigate('verify', recordData.recordId)}
              >
                Verify Document File
                <ExternalLink size={14} />
              </button>
            </div>

            <div className="details-grid">
              {/* Record ID */}
              <div className="detail-item">
                <div className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Hash size={14} /> Record ID
                </div>
                <div className="detail-value copy-row">
                  <span>{recordData.recordId}</span>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => copyToClipboard(recordData.recordId, 'Record ID')}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              {/* Timestamp */}
              <div className="detail-item">
                <div className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} /> Timestamp
                </div>
                <div className="detail-value">
                  {formatDate(recordData.timestamp)}
                </div>
              </div>

              {/* Document Hash */}
              <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                <div className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Hash size={14} /> Document Hash (SHA-256)
                </div>
                <div className="detail-value mono copy-row">
                  <span style={{ wordBreak: 'break-all' }}>{recordData.documentHash}</span>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => copyToClipboard(recordData.documentHash, 'Document Hash')}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              {/* Issuer Address */}
              {recordData.issuer && (
                <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                  <div className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} /> Issuer Blockchain Address
                  </div>
                  <div className="detail-value mono copy-row">
                    <span style={{ wordBreak: 'break-all' }}>{recordData.issuer}</span>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => copyToClipboard(recordData.issuer, 'Issuer Address')}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
