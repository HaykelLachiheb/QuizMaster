import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { classAPI, quizAPI } from '../services/api';

export default function ClassDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, quizRes] = await Promise.all([
          classAPI.getOne(id),
          quizAPI.listByClass(id),
        ]);
        setClassData(classRes.data);
        setQuizzes(quizRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-500)' }}>Loading...</div>;
  if (!classData) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--red)' }}>Class not found.</div>;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 8 }}>{classData.name}</h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: 8 }}>
          {classData.description || 'No description'}
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            padding: '4px 12px', background: 'var(--primary-light)',
            color: 'var(--primary)', borderRadius: 20, fontSize: '0.85rem', fontWeight: 500,
          }}>
            Code: {classData.code}
          </span>
          {user.role === 'teacher' && (
            <button onClick={() => {
              navigator.clipboard.writeText(classData.code);
            }} style={{
              padding: '4px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--gray-300)',
              background: 'white', fontSize: '0.85rem',
            }}>
              Copy Code
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3>Quizzes</h3>
        {user.role === 'teacher' && (
          <Link to={`/classes/${id}/create-quiz`}>
            <button style={{
              padding: '10px 20px', borderRadius: 'var(--radius)', border: 'none',
              background: 'var(--primary)', color: 'white', fontWeight: 600,
            }}>
              Create Quiz
            </button>
          </Link>
        )}
      </div>

      {quizzes.length === 0 ? (
        <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: 48 }}>
          No quizzes yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {quizzes.map((quiz) => (
            <div key={quiz.id} style={{
              background: 'white', padding: 20, borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow)', border: '1px solid var(--gray-200)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <h4 style={{ marginBottom: 4 }}>{quiz.title}</h4>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>
                  {quiz.question_count} questions
                  {quiz.time_limit > 0 ? ` | ${quiz.time_limit} min` : ''}
                  {quiz.published ? (
                    <span style={{ color: 'var(--success)', marginLeft: 8 }}>&bull; Published</span>
                  ) : (
                    <span style={{ color: 'var(--warning)', marginLeft: 8 }}>&bull; Draft</span>
                  )}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {user.role === 'teacher' && (
                  <>
                    <button onClick={() => navigate(`/quizzes/${quiz.id}/edit`)} style={{
                      padding: '6px 14px', borderRadius: 'var(--radius)',
                      border: '1px solid var(--gray-300)', background: 'white', fontSize: '0.85rem',
                    }}>
                      Edit
                    </button>
                    {!quiz.published && (
                      <button onClick={async () => {
                        try {
                          await quizAPI.publish(quiz.id);
                          const quizRes = await quizAPI.listByClass(id);
                          setQuizzes(quizRes.data);
                        } catch (err) {
                          alert(err.response?.data?.error || 'Failed to publish');
                        }
                      }} style={{
                        padding: '6px 14px', borderRadius: 'var(--radius)',
                        border: 'none', background: 'var(--success)', color: 'white', fontSize: '0.85rem',
                      }}>
                        Publish
                      </button>
                    )}
                    {quiz.published && (
                      <button onClick={() => navigate(`/quizzes/${quiz.id}/results`)} style={{
                        padding: '6px 14px', borderRadius: 'var(--radius)',
                        border: '1px solid var(--gray-300)', background: 'white', fontSize: '0.85rem',
                      }}>
                        Results
                      </button>
                    )}
                  </>
                )}
                {user.role === 'student' && quiz.published && (
                  <button onClick={() => navigate(`/quizzes/${quiz.id}/take`)} style={{
                    padding: '6px 14px', borderRadius: 'var(--radius)',
                    border: 'none', background: 'var(--primary)', color: 'white', fontSize: '0.85rem',
                  }}>
                    Take Quiz
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {user.role === 'teacher' && (
        <div style={{ marginTop: 40 }}>
          <h3 style={{ marginBottom: 16 }}>Students ({classData.students?.length || 0})</h3>
          {classData.students?.length === 0 ? (
            <p style={{ color: 'var(--gray-400)' }}>No students joined yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {classData.students?.map((s) => (
                <div key={s.id} style={{
                  background: 'white', padding: '12px 16', borderRadius: 'var(--radius)',
                  border: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between',
                }}>
                  <span>{s.name}</span>
                  <span style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>{s.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
