import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    quizAPI.getOne(id)
      .then((res) => {
        setQuiz(res.data);
        if (res.data.time_limit > 0) {
          setTimeLeft(res.data.time_limit * 60);
        }
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft, submitted]);

  const handleSelect = (questionId, optionId) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitted(true);
    try {
      const answerArray = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        question_id: questionId,
        selected_option_id: selectedOptionId,
      }));
      const res = await quizAPI.submit(id, answerArray);
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit');
      setSubmitted(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading quiz...</div>;
  if (!quiz) return <div style={{ textAlign: 'center', padding: 40 }}>Quiz not found.</div>;

  if (result) {
    const percentage = result.total_points > 0 ? Math.round((result.score / result.total_points) * 100) : 0;
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
        <div style={{
          background: 'white', padding: 48, borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <h2 style={{ marginBottom: 16 }}>Quiz Submitted!</h2>
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            background: percentage >= 70 ? 'var(--success)' : percentage >= 40 ? 'var(--warning)' : 'var(--danger)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', color: 'white', fontSize: '2rem', fontWeight: 700,
          }}>
            {percentage}%
          </div>
          <p style={{ fontSize: '1.2rem', marginBottom: 8 }}>
            Score: {result.score} / {result.total_points}
          </p>
          <button onClick={() => navigate('/dashboard')} style={{
            marginTop: 24, padding: '12px 32px', borderRadius: 'var(--radius)',
            border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 600, fontSize: '1rem',
          }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'white', padding: '16px 24', borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)', marginBottom: 24,
      }}>
        <div>
          <h2>{quiz.title}</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>{quiz.questions.length} questions</p>
        </div>
        {timeLeft !== null && (
          <div style={{
            padding: '8px 16px', background: timeLeft < 60 ? '#fef2f2' : 'var(--primary-light)',
            borderRadius: 'var(--radius)', fontWeight: 600,
            color: timeLeft < 60 ? 'var(--danger)' : 'var(--primary)',
          }}>
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {quiz.questions.map((q, idx) => (
        <div key={q.id} style={{
          background: 'white', padding: 24, borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)', marginBottom: 16, border: '1px solid var(--gray-200)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <strong>Question {idx + 1}</strong>
            <span style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>{q.points} pt(s)</span>
          </div>
          <p style={{ marginBottom: 16, fontSize: '1.05rem', lineHeight: 1.5 }}>{q.question_text}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {q.options.map((opt) => (
              <label key={opt.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16', borderRadius: 'var(--radius)',
                border: answers[q.id] === opt.id ? '2px solid var(--primary)' : '2px solid var(--gray-200)',
                background: answers[q.id] === opt.id ? 'var(--primary-light)' : 'white',
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  checked={answers[q.id] === opt.id}
                  onChange={() => handleSelect(q.id, opt.id)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span>{opt.option_text}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div style={{ textAlign: 'right', marginTop: 24, marginBottom: 48 }}>
        <button onClick={handleSubmit} style={{
          padding: '14px 40px', borderRadius: 'var(--radius)', border: 'none',
          background: 'var(--primary)', color: 'white', fontSize: '1.1rem', fontWeight: 600,
        }}>
          Submit Quiz
        </button>
      </div>
    </div>
  );
}
