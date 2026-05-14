import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import ClassDetail from './pages/ClassDetail';
import CreateQuiz from './pages/CreateQuiz';
import TakeQuiz from './pages/TakeQuiz';
import QuizResults from './pages/QuizResults';
import MyResults from './pages/MyResults';

export default function App() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/classes" element={
            <ProtectedRoute role="teacher"><Classes /></ProtectedRoute>
          } />
          <Route path="/classes/:id" element={
            <ProtectedRoute><ClassDetail /></ProtectedRoute>
          } />
          <Route path="/classes/:classId/create-quiz" element={
            <ProtectedRoute role="teacher"><CreateQuiz /></ProtectedRoute>
          } />
          <Route path="/quizzes/:id/edit" element={
            <ProtectedRoute role="teacher"><CreateQuiz /></ProtectedRoute>
          } />
          <Route path="/quizzes/:id/take" element={
            <ProtectedRoute role="student"><TakeQuiz /></ProtectedRoute>
          } />
          <Route path="/quizzes/:id/results" element={
            <ProtectedRoute role="teacher"><QuizResults /></ProtectedRoute>
          } />
          <Route path="/my-results" element={
            <ProtectedRoute role="student"><MyResults /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
