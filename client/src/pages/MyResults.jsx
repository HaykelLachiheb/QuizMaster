import { useState, useEffect } from 'react';
import { quizAPI } from '../services/api';

export default function MyResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizAPI.myResults()
      .then((res) => setResults(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading results...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>My Quiz Results</h2>

      {results.length === 0 ? (
        <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: 48 }}>
          You haven't taken any quizzes yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {results.map((r) => {
            const pct = r.total_points > 0 ? Math.round((r.score / r.total_points) * 100) : 0;
            return (
              <div key={r.id} style={{
                background: 'white', padding: 20, borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <h4 style={{ marginBottom: 4 }}>{r.quiz_title}</h4>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>
                    Class: {r.class_name} | Submitted: {new Date(r.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    padding: '4px 16px', borderRadius: 20,
                    background: pct >= 70 ? '#d1fae5' : pct >= 40 ? '#fef3c7' : '#fee2e2',
                    color: pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)',
                    fontWeight: 700, fontSize: '1.1rem',
                  }}>
                    {r.score}/{r.total_points} ({pct}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
