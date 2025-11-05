import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, BookOpen, LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login(email, password, role);
    if (success) {
      navigate(`/${role}`);
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  const demoCredentials = [
    { role: 'teacher', email: 'teacher@example.com', name: 'Dr. Sarah Johnson' },
    { role: 'student', email: 'student1@example.com', name: 'John Smith' },
    { role: 'student', email: 'student2@example.com', name: 'Emily Davis' },
    { role: 'student', email: 'student3@example.com', name: 'Michael Brown' }
  ];

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <BookOpen size={48} />
            <h1>ProjectFlow</h1>
          </div>
          <p className="subtitle">Student Group Project Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'teacher' | 'student')}
              className="form-select"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="button-spinner"></div>
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="demo-section">
          <h3>Demo Credentials</h3>
          <div className="demo-credentials">
            {demoCredentials.map((cred, index) => (
              <div 
                key={index} 
                className="demo-credential"
                onClick={() => {
                  setEmail(cred.email);
                  setRole(cred.role as 'teacher' | 'student');
                  setPassword('password123');
                }}
              >
                <div className="credential-role">
                  {cred.role === 'teacher' ? <User size={16} /> : <User size={16} />}
                  {cred.role}
                </div>
                <div className="credential-name">{cred.name}</div>
                <div className="credential-email">{cred.email}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
