import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import InputField from './components/InputField';
import ErrorMessage from './components/ErrorMessage';
import api from './services/api';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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
    setSuccessMessage('');

    const newErrors = {};

    if (formData.name.trim().length < 3) {
      newErrors.name = 'Full name must be at least 3 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/user/register', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      const token = response.data?.auth?.token || response.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }

      const user = response.data?.user || response.data?.data?.user || {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      setSuccessMessage('Account created successfully! Redirecting...');

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
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
        setGeneralError('Unable to connect to server. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="brand-header">
          <div className="brand-icon">
            <Zap size={28} className="brand-icon-svg" />
          </div>
          <h1 className="brand-title">FlowState</h1>
          <p className="brand-subtitle">Create your free account</p>
        </div>

        <ErrorMessage message={generalError} onClose={() => setGeneralError('')} />
        {successMessage && <div className="alert-box alert-success">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <InputField
            id="name"
            name="name"
            label="Full Name"
            placeholder="Jane Doe"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            icon={User}
            autoComplete="name"
            required
          />

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
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
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

          <InputField
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={formData.password_confirmation}
            onChange={handleChange}
            error={errors.password_confirmation}
            icon={Lock}
            autoComplete="new-password"
            required
          />

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="form-footer">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
}
