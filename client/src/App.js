// App.js
import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import Footer from './components/Footer';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import VotingInterface from './components/voting/VotingInterface';
import './App.css';

const AppContent = () => {
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="auth-wrapper">
      {!user ? (
        <>
          <div className="auth-card">
            <div className="auth-illustration">
              <img src="/assets/waving-bird.gif" alt="Waving Bird" className="auth-gif" />
            </div>
            <div className="auth-form-section">
              <h2>{showLogin ? "Log in" : "Sign up"}</h2>
              {showLogin ? <LoginForm /> : <RegisterForm />}
              <button onClick={() => setShowLogin(!showLogin)} className="toggle-btn">
                {showLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
              </button>
            </div>
          </div>

          <Footer />
        </>
      ) : (
        <div className="app-container-initial">
          <div className="user-info">
            <p>Welcome, {user.username} ({user.role})</p>
            <button onClick={logout}>Logout</button>
          </div>
          <VotingInterface />
        </div>
      )}
    </div>
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