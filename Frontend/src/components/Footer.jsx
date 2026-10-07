import React from 'react';
import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>
          <Shield size={18} style={{ color: 'var(--accent-light)' }} />
          VerID Blockchain Record Verification System
        </div>
        <div>
          Decentralized Cryptographic Provenance Layer &copy; {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
