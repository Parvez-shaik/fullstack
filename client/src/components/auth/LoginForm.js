import React, { useState, useEffect, forwardRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const LoginForm = forwardRef(({ triggerDemoLogin }, ref) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  useEffect(() => {
    if (triggerDemoLogin) {
      setEmail('admin@demo.com');
      setPassword('admin123');
      setTimeout(() => {
        if (ref && ref.current) {
          ref.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }, 100);
    }
  }, [triggerDemoLogin, ref]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} ref={ref}>
      {error && (
        <div style={{
          background: '#ffe5e5',
          color: '#b00020',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: 12,
          fontSize: '1rem',
          border: '1px solid #ffb3b3',
          textAlign: 'center',
        }}>{error}</div>
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" className="auth-btn-primary">Let's start!</button>
    </form>
  );
});

export default LoginForm; 