import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await register(username, email, password);
    if (!result.success) {
      setError(result.error);
    } else {
      alert("Registration successful! Please log in.");
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
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
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
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
      <button type="submit" className="auth-btn-primary">Sign up</button>
    </form>
  );
};

export default RegisterForm; 