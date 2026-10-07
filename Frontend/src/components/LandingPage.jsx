import React from 'react';
import { ShieldCheck, FileText, Hash, Database, CheckCircle, ArrowRight, Lock, Cpu, Eye, Zap } from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-badge">
          <ShieldCheck size={16} />
          Enterprise Tamper-Proof Document Verification
        </div>
        <h1 className="hero-title">
          Verify Records. Prove Authenticity.
        </h1>
        <p className="hero-subtitle">
          Secure digital asset provenance powered by immutable cryptographic hashing and decentralized blockchain verification.
        </p>

        <div className="hero-cta">
          <button className="btn btn-primary" onClick={() => onNavigate('register')}>
            Register Record
            <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('verify')}>
            <ShieldCheck size={18} />
            Verify Record
          </button>
        </div>
      </section>

      {/* How It Works Flowchart */}
      <section className="flow-section">
        <h2 className="section-title">Cryptographic Security Architecture</h2>
        <p className="section-subtitle">
          How raw file data is anchor-verified on the immutable blockchain ledger without leaking sensitive content.
        </p>

        <div className="flow-grid">
          <div className="flow-card">
            <div className="flow-step-num">1</div>
            <FileText className="flow-icon" />
            <h3 className="flow-card-title">Document Upload</h3>
            <p className="flow-card-desc">
              Raw document bytes are processed locally in memory. The actual file contents never leave your controlled scope.
            </p>
          </div>

          <div className="flow-card">
            <div className="flow-step-num">2</div>
            <Hash className="flow-icon" />
            <h3 className="flow-card-title">SHA-256 Hash</h3>
            <p className="flow-card-desc">
              A unique 256-bit cryptographic fingerprint is computed from the file's binary stream.
            </p>
          </div>

          <div className="flow-card">
            <div className="flow-step-num">3</div>
            <Database className="flow-icon" />
            <h3 className="flow-card-title">Blockchain Proof</h3>
            <p className="flow-card-desc">
              The hash and Record ID are permanently committed to an immutable Smart Contract ledger with timestamping.
            </p>
          </div>

          <div className="flow-card">
            <div className="flow-step-num">4</div>
            <CheckCircle className="flow-icon" />
            <h3 className="flow-card-title">Zero-Trust Verification</h3>
            <p className="flow-card-desc">
              Subsequent uploads instantly compare candidate SHA-256 hashes against the on-chain truth record.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ marginTop: '80px' }}>
        <h2 className="section-title">Built for Enterprise Security</h2>
        <p className="section-subtitle">
          Guaranteed integrity for certificates, legal contracts, medical records, and supply chain audit trails.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div className="card">
            <Lock className="flow-icon" style={{ color: 'var(--accent-light)' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Tamper-Evident Hashing</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Any alteration—even a single byte or pixel change—drastically mutates the SHA-256 digest, exposing tampered files immediately.
            </p>
          </div>

          <div className="card">
            <Cpu className="flow-icon" style={{ color: 'var(--accent-light)' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Immutable Smart Contracts</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Solidity smart contracts enforce strict write-once semantics. No admin, database corruption, or system breach can modify registered hashes.
            </p>
          </div>

          <div className="card">
            <Eye className="flow-icon" style={{ color: 'var(--accent-light)' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Privacy First</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Only one-way hashes are recorded. Confidential document text and personally identifiable data remain completely off-chain and private.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
