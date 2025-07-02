// App.js
import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import Footer from './components/Footer';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import VotingInterface from './components/voting/VotingInterface';
// import ThemeToggle from './components/ThemeToggle';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

const AuthIllustration = () => (
  <svg className="auth-illustration-img" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="110" cy="110" rx="110" ry="110" fill="#F6F9F6"/>
    <ellipse cx="110" cy="110" rx="90" ry="90" fill="#F5F5F7"/>
    <rect x="60" y="80" width="100" height="60" rx="30" fill="#F9C9A7"/>
    <ellipse cx="110" cy="110" rx="30" ry="30" fill="#F9C9A7"/>
    <rect x="80" y="100" width="10" height="30" rx="5" fill="#E28B6D"/>
    <rect x="130" y="100" width="10" height="30" rx="5" fill="#E28B6D"/>
    <ellipse cx="100" cy="115" rx="4" ry="4" fill="#1d1d1f"/>
    <ellipse cx="120" cy="115" rx="4" ry="4" fill="#1d1d1f"/>
    <rect x="105" y="125" width="10" height="4" rx="2" fill="#E28B6D"/>
  </svg>
);

const AuthSubtext = ({ isLogin }) => (
  <div className="subtext">
    {isLogin
      ? "Hello, friend! Log in to your account and get started."
      : "Sign up to create your account and join us!"}
  </div>
);

const SocialRow = () => (
  <div className="auth-social-row">
    <div className="auth-social-icon" title="Login with Facebook">
      <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" style={{ width: 20, height: 20 }} />
    </div>
    <div className="auth-social-icon" title="Login with Google">
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/180px-Google_%22G%22_logo.svg.png" alt="Google" style={{ width: 20, height: 20 }} />
    </div>
  </div>
);

const DemoBanner = () => (
  <div style={{
    width: '100%',
    background: '#fffbe6',
    color: '#8a6d1b',
    padding: '12px 0',
    textAlign: 'center',
    fontWeight: 600,
    fontSize: '1.05rem',
    borderBottom: '1.5px solid #ffe58f',
    zIndex: 2000,
    position: 'fixed',
    top: 0,
    left: 0
  }}>
    Demo Mode: Database is not connected. All data is for showcase only.
  </div>
);

const AppContent = () => {
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    fetch('/api/demo-status')
      .then(res => res.json())
      .then(data => setDemoMode(data.demoMode))
      .catch(() => setDemoMode(false));
  }, []);

  // Simulate loading state for demonstration
  const handleAuthAction = async (action) => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      {demoMode && <DemoBanner />}
      <div style={{ position: 'fixed', top: demoMode ? 48 : 24, right: 24, zIndex: 1000 }}>
        {/* <ThemeToggle /> */}
      </div>
      {isLoading && <LoadingSpinner fullScreen />}
      {!user ? (
        <div className="auth-main-container">
          <div className="auth-box">
            <div className="auth-illustration-col">
              <AuthIllustration />
            </div>
            <div className="auth-form-col">
              <h2>{showLogin ? "Log in" : "Sign up"}</h2>
              <AuthSubtext isLogin={showLogin} />
              <div className="auth-form" style={{ width: '100%' }}>
                {showLogin ? <LoginForm /> : <RegisterForm />}
                <SocialRow />
                <div className="auth-switch-row">
                  {showLogin ? (
                    <>Don't have an account?<span className="auth-switch-link" onClick={() => handleAuthAction(() => setShowLogin(false))}>Sign up</span></>
                  ) : (
                    <>Already have an account?<span className="auth-switch-link" onClick={() => handleAuthAction(() => setShowLogin(true))}>Log in</span></>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <section style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <p style={{ fontWeight: 500 }}>Welcome, {user.username} ({user.role})</p>
            <button onClick={() => handleAuthAction(logout)} style={{ minWidth: 100 }}>Logout</button>
          </div>
          <VotingInterface />
        </section>
      )}
      <Footer />
    </main>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;