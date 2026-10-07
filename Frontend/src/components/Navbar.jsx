import React from 'react';
import { Shield, FilePlus, Search, Sun, Moon, Server, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, backendStatus, isDarkMode, setIsDarkMode }) {
  return (
    <header className="navbar">
      <div className="container nav-container">
        <div className="brand" onClick={() => setActiveTab('landing')}>
          <div className="brand-icon">
            <Shield size={22} />
          </div>
          <div>
            <span>VerID</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginTop: '-4px' }}>
              Cryptographic Provenance
            </span>
          </div>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-btn ${activeTab === 'landing' ? 'active' : ''}`}
            onClick={() => setActiveTab('landing')}
          >
            Overview
          </button>

          <button
            className={`nav-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            <FilePlus size={16} />
            Register Record
          </button>

          <button
            className={`nav-btn ${activeTab === 'verify' ? 'active' : ''}`}
            onClick={() => setActiveTab('verify')}
          >
            <Shield size={16} />
            Verify Record
          </button>

          <button
            className={`nav-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <Search size={16} />
            Record Details
          </button>
        </nav>

        <div className="nav-actions">
          <div className="status-badge" title={backendStatus.connected ? 'Backend API and Node connected' : 'Backend connection error'}>
            <div className={`status-dot ${backendStatus.connected ? 'online' : 'offline'}`} />
            <Server size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: backendStatus.connected ? 'var(--text-primary)' : 'var(--red-main)' }}>
              {backendStatus.loading ? 'Checking...' : backendStatus.connected ? 'Node Online' : 'Offline'}
            </span>
          </div>

          <button
            className="theme-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
