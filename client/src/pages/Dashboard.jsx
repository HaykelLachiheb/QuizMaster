import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { classAPI, quizAPI } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [results, setResults] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const classRes = await classAPI.list();
      setClasses(classRes.data);
      if (user.role === 'student') {
        const resultRes = await quizAPI.myResults();
        setResults(resultRes.data);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleJoinClass = async (e) => {
    e.preventDefault();
    try {
      await classAPI.join(joinCode);
      setJoinCode('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-500)' }}>Loading...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Welcome, {user.name}!</h2>
      {error && (
        <div style={{ padding: 12, background: '#fef2f2', color: 'var(--danger)', borderRadius: 'var(--radius)', marginBottom: 16 }}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 12, background: 'none', border: 'none', color: 'var(--danger)', fontWeight: 600 }}>Dismiss</button>
        </div>
      )}

      {user.role === 'student' && (
        <div style={{ background: 'white', padding: 24, borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', marginBottom: 32 }}>
          <h3 style={{ marginBottom: 12 }}>Join a Class</h3>
          <form onSubmit={handleJoinClass} style={{ display: 'flex', gap: 12 }}>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter class code"
              style={{
                flex: 1, padding: '10px 12px', border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius)', fontSize: '1rem', textTransform: 'uppercase',
              }}
            />
            <button type="submit" style={{
              padding: '10px 24px', borderRadius: 'var(--radius)', border: 'none',
              background: 'var(--primary)', color: 'white', fontWeight: 600,
            }}>
              Join
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>My Classes</h3>
            {user.role === 'teacher' && (
              <Link to="/classes">
                <button style={{
                  padding: '8px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--gray-300)',
                  background: 'white', fontSize: '0.875rem', cursor: 'pointer',
                }}>
                  Manage Classes
                </button>
              </Link>
            )}
          </div>
          {classes.length === 0 ? (
            <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: 32 }}>
              {user.role === 'teacher' ? 'Create your first class!' : 'Join a class to get started!'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {classes.map((c) => (
                <Link key={c.id} to={`/classes/${c.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'white', padding: 16, borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)',
                    transition: 'box-shadow 0.2s',
                  }}>
                    <h4 style={{ color: 'var(--gray-900)', marginBottom: 4 }}>{c.name}</h4>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>
                      Code: {c.code}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {user.role === 'student' && (
          <div>
            <h3 style={{ marginBottom: 16 }}>Recent Results</h3>
            {results.length === 0 ? (
              <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: 32 }}>
                No quizzes taken yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {results.slice(0, 5).map((r) => (
                  <div key={r.id} style={{
                    background: 'white', padding: 16, borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)',
                  }}>
                    <h4 style={{ marginBottom: 4 }}>{r.quiz_title}</h4>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>
                      Class: {r.class_name} | Score: {r.score}/{r.total_points}
                      ({r.total_points > 0 ? Math.round((r.score / r.total_points) * 100) : 0}%)
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
