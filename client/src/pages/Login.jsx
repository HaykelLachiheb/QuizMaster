import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto' }}>
      <h2 style={{ marginBottom: 24, textAlign: 'center' }}>Sign In</h2>
      {error && (
        <div style={{
          padding: 12,
          background: '#fef2f2',
          color: 'var(--danger)',
          borderRadius: 'var(--radius)',
          marginBottom: 16,
          fontSize: '0.9rem',
        }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{
        background: 'white',
        padding: 32,
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--gray-300)',
              borderRadius: 'var(--radius)',
              fontSize: '1rem',
            }}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--gray-300)',
              borderRadius: 'var(--radius)',
              fontSize: '1rem',
            }}
          />
        </div>
        <button type="submit" style={{
          width: '100%',
          padding: '12px',
          borderRadius: 'var(--radius)',
          border: 'none',
          background: 'var(--primary)',
          color: 'white',
          fontSize: '1rem',
          fontWeight: 600,
        }}>
          Sign In
        </button>
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: '0.9rem', color: 'var(--gray-500)' }}>
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
