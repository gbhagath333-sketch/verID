import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import RegisterPage from './components/RegisterPage';
import VerifyPage from './components/VerifyPage';
import RecordDetailsPage from './components/RecordDetailsPage';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { checkHealth } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [targetRecordId, setTargetRecordId] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [backendStatus, setBackendStatus] = useState({ loading: true, connected: false });

  // Handle dark mode class on body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [isDarkMode]);

  // Check URL params on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryRecordId = params.get('recordId') || params.get('id');
    const queryTab = params.get('tab');

    if (queryRecordId) {
      setTargetRecordId(queryRecordId);
      setActiveTab('verify');
    } else if (queryTab && ['landing', 'register', 'verify', 'details'].includes(queryTab)) {
      setActiveTab(queryTab);
    }
  }, []);

  // Poll backend health status
  useEffect(() => {
    let isMounted = true;

    const verifyHealth = async () => {
      try {
        const data = await checkHealth();
        if (isMounted) {
          const isConnected = data?.success && (data?.blockchain?.connected !== false);
          setBackendStatus({
            loading: false,
            connected: isConnected,
            data,
          });
        }
      } catch (err) {
        if (isMounted) {
          setBackendStatus({
            loading: false,
            connected: false,
            error: err.message,
          });
        }
      }
    };

    verifyHealth();
    const interval = setInterval(verifyHealth, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleNavigate = (tab, recordId = '') => {
    if (recordId) {
      setTargetRecordId(recordId);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  return (
    <div className="app-layout">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => handleNavigate(tab)}
        backendStatus={backendStatus}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <main className="main-content">
        <div className="container">
          {activeTab === 'landing' && <LandingPage onNavigate={handleNavigate} />}
          {activeTab === 'register' && (
            <RegisterPage onNavigate={handleNavigate} showToast={showToast} />
          )}
          {activeTab === 'verify' && (
            <VerifyPage
              initialRecordId={targetRecordId}
              onNavigate={handleNavigate}
              showToast={showToast}
            />
          )}
          {activeTab === 'details' && (
            <RecordDetailsPage
              initialRecordId={targetRecordId}
              onNavigate={handleNavigate}
              showToast={showToast}
            />
          )}
        </div>
      </main>

      <Footer />
      <Toast message={toastMessage} />
    </div>
  );
}
