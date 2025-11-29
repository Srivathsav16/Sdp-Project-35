import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import "../App.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        const result = await signup(name, email, password, role);
        if (result.success) {
          navigate(`/${role}`);
        } else {
          setError(result.error || "Sign up failed. Please try again.");
        }
        return;
      }

      const result = await login(email, password);
      if (result.success) {
        navigate(`/${result.user.role}`);
      } else {
        setError(result.error || "Invalid email or password");
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="fullpage-bg">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <span role="img" aria-label="book" style={{ fontSize: 32 }}>📖</span>
            <h1>ProjectFlow</h1>
          </div>
          <div className="subtitle">
            Student Group Project Management System
          </div>
        </div>
        {error && (
          <div className="error-message">{error}</div>
        )}
        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
          {isSignUp && (
            <>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  className="form-input"
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  className="form-select"
                  id="role"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  required
                >
                  <option value="" disabled>Select role</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
            </>
          )}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              className="form-input"
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="off"
              required
            />
          </div>
          <div className="form-group password-input-container">
            <label htmlFor="password">Password</label>
            <input
              className="form-input"
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                className="form-input"
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
              />
            </div>
          )}
          <button type="submit" className="login-button">
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>
        <div style={{ textAlign: "center" }}>
          <span>{isSignUp ? "Already have an account?" : "Don't have an account?"}</span>
          <button
            type="button"
            style={{
              marginLeft: "0.5rem",
              background: "none",
              border: "none",
              color: "#667eea",
              cursor: "pointer",
              fontWeight: "bold"
            }}
            onClick={() => {
              setIsSignUp(prev => !prev);
              // Clear all fields and prevent autofill when switching modes
              setName("");
              setRole("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
            }}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;