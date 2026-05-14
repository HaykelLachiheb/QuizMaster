import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto' }}>
      <h2 style={{ marginBottom: 24, textAlign: 'center' }}>Create Account</h2>
      {error && (
        <div style={{
          padding: 12, background: '#fef2f2', color: 'var(--danger)',
          borderRadius: 'var(--radius)', marginBottom: 16, fontSize: '0.9rem',
        }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{
        background: 'white', padding: 32, borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>Name</label>
          <input name="name" value={form.name} onChange={handleChange} required style={{
            width: '100%', padding: '10px 12px', border: '1px solid var(--gray-300)',
            borderRadius: 'var(--radius)', fontSize: '1rem',
          }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required style={{
            width: '100%', padding: '10px 12px', border: '1px solid var(--gray-300)',
            borderRadius: 'var(--radius)', fontSize: '1rem',
          }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} style={{
            width: '100%', padding: '10px 12px', border: '1px solid var(--gray-300)',
            borderRadius: 'var(--radius)', fontSize: '1rem',
          }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>I am a...</label>
          <select name="role" value={form.role} onChange={handleChange} style={{
            width: '100%', padding: '10px 12px', border: '1px solid var(--gray-300)',
            borderRadius: 'var(--radius)', fontSize: '1rem', background: 'white',
          }}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
        <button type="submit" style={{
          width: '100%', padding: '12px', borderRadius: 'var(--radius)',
          border: 'none', background: 'var(--primary)', color: 'white',
          fontSize: '1rem', fontWeight: 600,
        }}>
          Create Account
        </button>
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: '0.9rem', color: 'var(--gray-500)' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
