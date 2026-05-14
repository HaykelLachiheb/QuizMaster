import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { classAPI } from '../services/api';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const fetchClasses = async () => {
    try {
      const res = await classAPI.list();
      setClasses(res.data);
    } catch (err) {
      setError('Failed to load classes');
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await classAPI.create(form);
      setForm({ name: '', description: '' });
      setShowCreate(false);
      fetchClasses();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create class');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>My Classes</h2>
        <button onClick={() => setShowCreate(!showCreate)} style={{
          padding: '10px 20px', borderRadius: 'var(--radius)', border: 'none',
          background: 'var(--primary)', color: 'white', fontWeight: 600,
        }}>
          {showCreate ? 'Cancel' : 'Create Class'}
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, background: '#fef2f2', color: 'var(--danger)', borderRadius: 'var(--radius)', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {showCreate && (
        <form onSubmit={handleCreate} style={{
          background: 'white', padding: 24, borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-md)', marginBottom: 24,
        }}>
          <h3 style={{ marginBottom: 16 }}>Create New Class</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>Class Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{
              width: '100%', padding: '10px 12px', border: '1px solid var(--gray-300)',
              borderRadius: 'var(--radius)', fontSize: '1rem',
            }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{
              width: '100%', padding: '10px 12px', border: '1px solid var(--gray-300)',
              borderRadius: 'var(--radius)', fontSize: '1rem', resize: 'vertical',
            }} />
          </div>
          <button type="submit" style={{
            padding: '10px 24px', borderRadius: 'var(--radius)', border: 'none',
            background: 'var(--primary)', color: 'white', fontWeight: 600,
          }}>
            Create
          </button>
        </form>
      )}

      {classes.length === 0 ? (
        <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: 48 }}>
          No classes yet. Create one to get started!
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
          {classes.map((c) => (
            <Link key={c.id} to={`/classes/${c.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'white', padding: 24, borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)',
              }}>
                <h3 style={{ color: 'var(--gray-900)', marginBottom: 8 }}>{c.name}</h3>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: 12 }}>
                  {c.description || 'No description'}
                </p>
                <div style={{
                  display: 'inline-block', padding: '4px 12px', background: 'var(--primary-light)',
                  color: 'var(--primary)', borderRadius: 20, fontSize: '0.85rem', fontWeight: 500,
                }}>
                  Code: {c.code}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
