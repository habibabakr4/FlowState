import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import InputField from './components/InputField';
import ErrorMessage from './components/ErrorMessage';
import api from './services/api';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();

  // 1. Form fields matching Laravel RegisterRequest requirements
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  // 2. UI interaction state
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 3. Handle change for any input field
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 4. Form submission & API request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Client-side quick validations
    if (formData.name.trim().length < 3) {
      setErrorMessage('Full name must be at least 3 characters.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      // POST request to Laravel: /api/v1/user/register
      const response = await api.post('/user/register', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      // Extract Sanctum token if returned
      const token = response.data?.auth?.token || response.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }

      // Store authenticated user
      const user = response.data?.user || response.data?.data?.user || {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      setSuccessMessage('Account created successfully! Redirecting...');

      // Redirect user to dashboard or login
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      // Handle Laravel validation errors (422) or generic server errors
      if (err.response?.data?.errors) {
        // Collect first validation message
        const firstErrorKey = Object.keys(err.response.data.errors)[0];
        setErrorMessage(err.response.data.errors[firstErrorKey][0]);
      } else if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Unable to connect to server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        {/* Brand Header */}
        <div className="brand-header">
          <div className="brand-icon">
            <Zap size={28} className="brand-icon-svg" />
          </div>
          <h1 className="brand-title">FlowState</h1>
          <p className="brand-subtitle">Create your free account</p>
        </div>

        {/* Feedback Alerts */}
        <ErrorMessage message={errorMessage} onClose={() => setErrorMessage('')} />
        {successMessage && <div className="alert-box alert-success">{successMessage}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="register-form">
          {/* Full Name */}
          <InputField
            id="name"
            name="name"
            label="Full Name"
            placeholder="Jane Doe"
            value={formData.name}
            onChange={handleChange}
            icon={User}
            autoComplete="name"
            required
          />

          {/* Email */}
          <InputField
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            icon={Mail}
            autoComplete="email"
            required
          />

          {/* Password */}
          <InputField
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={handleChange}
            icon={Lock}
            autoComplete="new-password"
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

          {/* Confirm Password */}
          <InputField
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={formData.password_confirmation}
            onChange={handleChange}
            icon={Lock}
            autoComplete="new-password"
            required
          />

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer / Switch to Login */}
        <div className="form-footer">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
}