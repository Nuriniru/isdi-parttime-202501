import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { validator, errors } from 'common';
import { useValidation } from '../hooks/useValidation';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { validationErrors, validateField, clearErrors, hasErrors } = useValidation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      clearErrors();
      setError('');

      if (!formData.username.trim()) {
        setError('Username is required');
        return;
      }

      if (!formData.email.trim()) {
        setError('Email is required');
        return;
      }

      if (!formData.password) {
        setError('Password is required');
        return;
      }

      if (!formData.confirmPassword) {
        setError('Please confirm your password');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const emailValidation = validateField('email', formData.email, 'email');
      const passwordValidation = validateField('password', formData.password, 'password');
      const emailValid = emailValidation.isValid;
      const passwordValid = passwordValidation.isValid;

      if (!emailValid || !passwordValid || hasErrors) {
        if (!emailValid) {
          setError(emailValidation.error);
        } else if (!passwordValid) {
          setError(passwordValidation.error);
        }
        return;
      }

      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }

      const passwordErrors = [];
      if (!/[A-Z]/.test(formData.password)) passwordErrors.push('uppercase letter');
      if (!/[a-z]/.test(formData.password)) passwordErrors.push('lowercase letter');
      if (!/[0-9]/.test(formData.password)) passwordErrors.push('number');
      if (!/[$&!@=*^ñ?¿¡\/#ªº¬]/.test(formData.password)) passwordErrors.push('special character ($&!@=*^ñ?¿¡/#ªº¬)');

      if (passwordErrors.length > 0) {
        setError(`Password needs: ${passwordErrors.join(', ')}`);
        return;
      }

      setLoading(true);

      const result = await register(formData.username, formData.email, formData.password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = (e) => {
    // Button click handler for form submission
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Password (8+ chars, uppercase, lowercase, number, special char)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {validationErrors && Object.keys(validationErrors).length > 0 && (
            <div className="text-red-400 text-sm text-center">
              Validation errors: {Object.values(validationErrors).join(', ')}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              onClick={handleButtonClick}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-gray-300">Already have an account? </span>
            <Link to="/login" className="font-medium text-purple-400 hover:text-purple-300">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;