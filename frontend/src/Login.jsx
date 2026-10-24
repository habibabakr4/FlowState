import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, CheckCircle2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import InputField from './components/InputField';
import ErrorMessage from './components/ErrorMessage';
import api from './services/api';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');

    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/user/login', {
        email: formData.email.trim(),
        password: formData.password,
      });

      const token = response.data?.auth?.token || response.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }

      const user = response.data?.user || response.data?.data?.user;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.errors) {
        const backendErrors = {};
        Object.entries(err.response.data.errors).forEach(([field, messages]) => {
          backendErrors[field] = Array.isArray(messages) ? messages[0] : messages;
        });
        setErrors(backendErrors);
      } else if (err.response?.data?.message) {
        setGeneralError(err.response.data.message);
      } else {
        setGeneralError('Unable to connect to the server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-hero">
        <div className="hero-circle circle-1"></div>
        <div className="hero-circle circle-2"></div>

        <div className="hero-brand">
          <div className="hero-brand-icon">
            <Zap size={22} color="#ffffff" fill="#ffffff" />
          </div>
          <span className="hero-brand-name">FlowState</span>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">Sign in to your workspace</h1>
          <p className="hero-description">
            The fast, modern workspace for teams who ship. Organize projects, track tasks, and stay in flow.
          </p>

          <ul className="hero-features">
            <li className="hero-feature-item">
              <CheckCircle2 size={18} className="hero-feature-icon" />
              <span>Visual Kanban &amp; list task management</span>
            </li>
            <li className="hero-feature-item">
              <CheckCircle2 size={18} className="hero-feature-icon" />
              <span>Track priorities, due dates, and assignees</span>
            </li>
            <li className="hero-feature-item">
              <CheckCircle2 size={18} className="hero-feature-icon" />
              <span>Collaborate with threaded comments</span>
            </li>
          </ul>
        </div>

        <div className="hero-footer">
          &copy; 2026 FlowState. Built for teams that move fast.
        </div>
      </div>

      <div className="login-form-panel">
        <div className="login-form-wrapper">
          <div className="login-header">
            <h2 className="login-title">Welcome back</h2>
            <p className="login-subtitle">Enter your credentials to access your workspace.</p>
          </div>

          <ErrorMessage message={generalError} onClose={() => setGeneralError('')} />

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <InputField
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={Mail}
              autoComplete="email"
              required
            />

            <InputField
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={Lock}
              autoComplete="current-password"
              required
              trailingAction={
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            Don't have an account?{' '}
            <Link to="/signup" className="login-link">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
