import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';

const emptyQuestion = () => ({
  question_text: '',
  question_type: 'multiple_choice',
  points: 1,
  options: [
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
  ],
});

export default function CreateQuiz() {
  const { classId, id: editId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!editId;
  const [form, setForm] = useState({
    title: '',
    description: '',
    class_id: classId || '',
    time_limit: 0,
    questions: [emptyQuestion()],
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      quizAPI.getOne(editId).then((res) => {
        const quiz = res.data;
        setForm({
          title: quiz.title,
          description: quiz.description || '',
          class_id: quiz.class_id,
          time_limit: quiz.time_limit,
          questions: quiz.questions.map((q) => ({
            ...q,
            options: q.options.map((o) => ({
              option_text: o.option_text,
              is_correct: o.is_correct,
            })),
          })),
        });
      }).catch(() => navigate('/dashboard'));
    }
  }, [editId]);

  const addQuestion = () => {
    setForm({ ...form, questions: [...form.questions, emptyQuestion()] });
  };

  const removeQuestion = (index) => {
    if (form.questions.length <= 1) return;
    setForm({
      ...form,
      questions: form.questions.filter((_, i) => i !== index),
    });
  };

  const updateQuestion = (index, field, value) => {
    const questions = [...form.questions];
    questions[index] = { ...questions[index], [field]: value };
    if (field === 'question_type' && value === 'true_false') {
      questions[index].options = [
        { option_text: 'True', is_correct: true },
        { option_text: 'False', is_correct: false },
      ];
    }
    setForm({ ...form, questions });
  };

  const updateOption = (qIndex, oIndex, field, value) => {
    const questions = [...form.questions];
    if (field === 'is_correct' && value === true) {
      questions[qIndex].options = questions[qIndex].options.map((o, i) => ({
        ...o,
        is_correct: i === oIndex,
      }));
    } else {
      questions[qIndex].options[oIndex] = {
        ...questions[qIndex].options[oIndex],
        [field]: value,
      };
    }
    setForm({ ...form, questions });
  };

  const addOption = (qIndex) => {
    const questions = [...form.questions];
    questions[qIndex].options.push({ option_text: '', is_correct: false });
    setForm({ ...form, questions });
  };

  const removeOption = (qIndex, oIndex) => {
    const questions = [...form.questions];
    if (questions[qIndex].options.length <= 2) return;
    questions[qIndex].options = questions[qIndex].options.filter((_, i) => i !== oIndex);
    setForm({ ...form, questions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (isEdit) {
        await quizAPI.update(editId, form);
        navigate(`/classes/${form.class_id}`);
      } else {
        await quizAPI.create(form);
        navigate(`/classes/${form.class_id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 24 }}>{isEdit ? 'Edit Quiz' : 'Create New Quiz'}</h2>

      {error && (
        <div style={{ padding: 12, background: '#fef2f2', color: 'var(--danger)', borderRadius: 'var(--radius)', marginBottom: 16 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ background: 'white', padding: 24, borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Quiz Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={{
              width: '100%', padding: '10px 12px', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius)', fontSize: '1rem',
            }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{
              width: '100%', padding: '10px 12px', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius)', fontSize: '1rem',
            }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Time Limit (minutes, 0 = no limit)</label>
            <input type="number" value={form.time_limit} onChange={(e) => setForm({ ...form, time_limit: parseInt(e.target.value) || 0 })} min={0} style={{
              width: 200, padding: '10px 12px', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius)', fontSize: '1rem',
            }} />
          </div>
        </div>

        <h3 style={{ marginBottom: 16 }}>Questions</h3>

        {form.questions.map((q, qIndex) => (
          <div key={qIndex} style={{
            background: 'white', padding: 24, borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)', marginBottom: 16, border: '1px solid var(--gray-200)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <strong>Question {qIndex + 1}</strong>
              <button type="button" onClick={() => removeQuestion(qIndex)} style={{
                padding: '4px 12px', borderRadius: 'var(--radius)',
                border: '1px solid var(--danger)', background: 'white', color: 'var(--danger)', fontSize: '0.85rem',
              }}>
                Remove
              </button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <textarea value={q.question_text} onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)} required rows={2} placeholder="Enter your question" style={{
                width: '100%', padding: '10px 12px', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius)', fontSize: '1rem',
              }} />
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>Type</label>
                <select value={q.question_type} onChange={(e) => updateQuestion(qIndex, 'question_type', e.target.value)} style={{
                  padding: '8px 12px', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius)', background: 'white',
                }}>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>Points</label>
                <input type="number" value={q.points} onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 1)} min={1} style={{
                  width: 80, padding: '8px 12px', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius)',
                }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--gray-500)', display: 'block', marginBottom: 8 }}>Options</label>
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <input
                    type={q.question_type === 'true_false' ? 'radio' : 'radio'}
                    name={`correct-${qIndex}`}
                    checked={opt.is_correct}
                    onChange={() => updateOption(qIndex, oIndex, 'is_correct', true)}
                  />
                  <input
                    value={opt.option_text}
                    onChange={(e) => updateOption(qIndex, oIndex, 'option_text', e.target.value)}
                    placeholder={`Option ${oIndex + 1}`}
                    required
                    disabled={q.question_type === 'true_false'}
                    style={{
                      flex: 1, padding: '8px 12px', border: '1px solid var(--gray-300)',
                      borderRadius: 'var(--radius)', fontSize: '0.95rem',
                    }}
                  />
                  {q.question_type === 'multiple_choice' && q.options.length > 2 && (
                    <button type="button" onClick={() => removeOption(qIndex, oIndex)} style={{
                      padding: '4px 8px', borderRadius: 'var(--radius)',
                      border: '1px solid var(--gray-300)', background: 'white', color: 'var(--gray-500)', fontSize: '0.85rem',
                    }}>
                      &times;
                    </button>
                  )}
                </div>
              ))}
              {q.question_type === 'multiple_choice' && (
                <button type="button" onClick={() => addOption(qIndex)} style={{
                  padding: '6px 14px', borderRadius: 'var(--radius)',
                  border: '1px dashed var(--gray-400)', background: 'white', color: 'var(--gray-500)', fontSize: '0.85rem', marginTop: 4,
                }}>
                  + Add Option
                </button>
              )}
              <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: 4 }}>
                Select the radio button next to the correct answer.
              </p>
            </div>
          </div>
        ))}

        <button type="button" onClick={addQuestion} style={{
          width: '100%', padding: 14, borderRadius: 'var(--radius)',
          border: '2px dashed var(--gray-300)', background: 'white', color: 'var(--gray-500)',
          fontSize: '1rem', marginBottom: 24,
        }}>
          + Add Question
        </button>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate(`/classes/${form.class_id || classId}`)} style={{
            padding: '12px 24px', borderRadius: 'var(--radius)',
            border: '1px solid var(--gray-300)', background: 'white', fontSize: '1rem',
          }}>
            Cancel
          </button>
          <button type="submit" disabled={saving} style={{
            padding: '12px 24px', borderRadius: 'var(--radius)', border: 'none',
            background: 'var(--primary)', color: 'white', fontSize: '1rem', fontWeight: 600,
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Saving...' : isEdit ? 'Update Quiz' : 'Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}
