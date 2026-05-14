import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';

export default function QuizResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizRes, resultsRes] = await Promise.all([
          quizAPI.getOne(id),
          quizAPI.results(id),
        ]);
        setQuiz(quizRes.data);
        setResults(resultsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading results...</div>;
  if (!quiz) return <div style={{ textAlign: 'center', padding: 40 }}>Quiz not found.</div>;

  const averageScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.total_points > 0 ? (r.score / r.total_points) * 100 : 0), 0) / results.length)
    : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2>{quiz.title} - Results</h2>
          <p style={{ color: 'var(--gray-500)' }}>{results.length} submissions | Average: {averageScore}%</p>
        </div>
        <button onClick={() => navigate(`/classes/${quiz.class_id}`)} style={{
          padding: '10px 20px', borderRadius: 'var(--radius)',
          border: '1px solid var(--gray-300)', background: 'white',
        }}>
          Back to Class
        </button>
      </div>

      <div style={{
        background: 'white', padding: 24, borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)', marginBottom: 24,
      }}>
        <h3 style={{ marginBottom: 16 }}>Score Distribution</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120 }}>
          {[0, 20, 40, 60, 80, 100].map((bucket) => {
            const count = results.filter((r) => {
              const pct = r.total_points > 0 ? (r.score / r.total_points) * 100 : 0;
              return pct >= bucket && pct < bucket + 20;
            }).length;
            const maxCount = Math.max(1, ...results.map((r) => {
              const pct = r.total_points > 0 ? (r.score / r.total_points) * 100 : 0;
              return [0, 20, 40, 60, 80, 100].map((b) => {
                return results.filter((rr) => {
                  const pp = rr.total_points > 0 ? (rr.score / rr.total_points) * 100 : 0;
                  return pp >= b && pp < b + 20;
                }).length;
              }).reduce((a, b) => Math.max(a, b), 1);
            }));
            const height = (count / maxCount) * 100;
            return (
              <div key={bucket} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  height: `${height}%`, background: 'var(--primary)',
                  borderRadius: 'var(--radius) var(--radius) 0 0',
                  opacity: 0.6 + (height / 100) * 0.4,
                  minHeight: 4,
                }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 4 }}>
                  {bucket}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {results.length === 0 ? (
        <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: 48 }}>No submissions yet.</p>
      ) : (
        <div style={{ background: 'white', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-200)' }}>Student</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-200)' }}>Score</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-200)' }}>Percentage</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-200)' }}>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const pct = r.total_points > 0 ? Math.round((r.score / r.total_points) * 100) : 0;
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '12px 16px' }}>{r.student_name}</td>
                    <td style={{ padding: '12px 16px' }}>{r.score} / {r.total_points}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 12,
                        background: pct >= 70 ? '#d1fae5' : pct >= 40 ? '#fef3c7' : '#fee2e2',
                        color: pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)',
                        fontWeight: 600, fontSize: '0.85rem',
                      }}>
                        {pct}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--gray-500)', fontSize: '0.9rem' }}>
                      {new Date(r.submitted_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
