import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid var(--gray-200)',
      padding: '0 24px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadow)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <Link to="/" style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--primary)',
          textDecoration: 'none',
        }}>
          QuizMaster
        </Link>
        {user && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Link to="/dashboard" style={{ color: 'var(--gray-600)', textDecoration: 'none', fontSize: '0.9rem' }}>
              Dashboard
            </Link>
            {user.role === 'teacher' && (
              <Link to="/classes" style={{ color: 'var(--gray-600)', textDecoration: 'none', fontSize: '0.9rem' }}>
                My Classes
              </Link>
            )}
            {user.role === 'student' && (
              <Link to="/my-results" style={{ color: 'var(--gray-600)', textDecoration: 'none', fontSize: '0.9rem' }}>
                My Results
              </Link>
            )}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {user ? (
          <>
            <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
              {user.name} ({user.role})
            </span>
            <button onClick={handleLogout} style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--gray-300)',
              background: 'white',
              fontSize: '0.875rem',
              color: 'var(--gray-700)',
            }}>
              Logout
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/login">
              <button style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--gray-300)',
                background: 'white',
                fontSize: '0.875rem',
              }}>
                Login
              </button>
            </Link>
            <Link to="/register">
              <button style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius)',
                border: 'none',
                background: 'var(--primary)',
                color: 'white',
                fontSize: '0.875rem',
              }}>
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
