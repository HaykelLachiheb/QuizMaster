import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{ textAlign: 'center', paddingTop: '80px' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 16, color: 'var(--gray-900)' }}>
        QuizMaster
      </h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--gray-500)', maxWidth: 600, margin: '0 auto 40px' }}>
        A modern assessment platform for educators and students. Create quizzes,
        manage classes, and track performance in real-time.
      </p>
      {user ? (
        <Link to="/dashboard">
          <button style={{
            padding: '14px 32px',
            fontSize: '1.1rem',
            borderRadius: 'var(--radius)',
            border: 'none',
            background: 'var(--primary)',
            color: 'white',
            fontWeight: 600,
          }}>
            Go to Dashboard
          </button>
        </Link>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <Link to="/register">
            <button style={{
              padding: '14px 32px',
              fontSize: '1.1rem',
              borderRadius: 'var(--radius)',
              border: 'none',
              background: 'var(--primary)',
              color: 'white',
              fontWeight: 600,
            }}>
              Get Started
            </button>
          </Link>
          <Link to="/login">
            <button style={{
              padding: '14px 32px',
              fontSize: '1.1rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--gray-300)',
              background: 'white',
              color: 'var(--gray-700)',
              fontWeight: 600,
            }}>
              Sign In
            </button>
          </Link>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 24,
        marginTop: 80,
        textAlign: 'left',
      }}>
        {[
          { title: 'For Teachers', items: ['Create quizzes with multiple question types', 'Manage classes with invite codes', 'View detailed analytics and results'] },
          { title: 'For Students', items: ['Join classes using a code', 'Take timed quizzes', 'Track your performance over time'] },
          { title: 'Smart Features', items: ['Automatic grading', 'Real-time results', 'Progress tracking'] },
        ].map((section) => (
          <div key={section.title} style={{
            padding: 24,
            background: 'white',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)',
          }}>
            <h3 style={{ marginBottom: 12, color: 'var(--primary)' }}>{section.title}</h3>
            <ul style={{ listStyle: 'none', color: 'var(--gray-600)' }}>
              {section.items.map((item) => (
                <li key={item} style={{ padding: '4px 0' }}>&bull; {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
