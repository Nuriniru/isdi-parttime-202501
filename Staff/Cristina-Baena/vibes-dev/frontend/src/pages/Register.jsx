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
    console.log(`Field ${name} changed to:`, value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    console.log('=== FORM SUBMISSION STARTED ===');
    e.preventDefault();
    console.log('preventDefault called');
    console.log('Form data:', { ...formData, password: '[HIDDEN]', confirmPassword: '[HIDDEN]' });
    
    try {
      clearErrors();
      setError('');
      console.log('Errors cleared');

      // Basic validation with detailed logging
      if (!formData.username.trim()) {
        console.log('Validation failed: Username is required');
        setError('Username is required');
        return;
      }
      console.log('Username validation passed');

      if (!formData.email.trim()) {
        console.log('Validation failed: Email is required');
        setError('Email is required');
        return;
      }
      console.log('Email validation passed');

      if (!formData.password) {
        console.log('Validation failed: Password is required');
        setError('Password is required');
        return;
      }
      console.log('Password validation passed');

      if (!formData.confirmPassword) {
        console.log('Validation failed: Confirm password is required');
        setError('Please confirm your password');
        return;
      }
      console.log('Confirm password validation passed');

      // Password confirmation check
      if (formData.password !== formData.confirmPassword) {
        console.log('Validation failed: Passwords do not match');
        setError('Passwords do not match');
        return;
      }
      console.log('Password match validation passed');

      // Use common package validators
      console.log('Starting advanced validation...');

      const emailValidation = validateField('email', formData.email, 'email');
      const passwordValidation = validateField('password', formData.password, 'password');
      const emailValid = emailValidation.isValid;
      const passwordValid = passwordValidation.isValid;

      console.log('Advanced validation results:', { emailValid, passwordValid, hasErrors });

      if (!emailValid || !passwordValid || hasErrors) {
        console.log('Advanced validation failed:', { 
          emailValid, 
          passwordValid, 
          hasErrors, 
          emailError: emailValidation.error,
          passwordError: passwordValidation.error,
          validationErrors 
        });
        
        // Set the specific error message
        if (!emailValid) {
          setError(emailValidation.error);
        } else if (!passwordValid) {
          setError(passwordValidation.error);
        }
        return;
      }

      // Validate password strength
      if (formData.password.length < 8) {
        console.log('Validation failed: Password too short');
        setError('Password must be at least 8 characters long');
        return;
      }
      console.log('Password length validation passed');

      // Add more comprehensive password validation
      const passwordErrors = [];
      if (!/[A-Z]/.test(formData.password)) passwordErrors.push('uppercase letter');
      if (!/[a-z]/.test(formData.password)) passwordErrors.push('lowercase letter');
      if (!/[0-9]/.test(formData.password)) passwordErrors.push('number');
      if (!/[$&!@=*^ñ?¿¡\/#ªº¬]/.test(formData.password)) passwordErrors.push('special character ($&!@=*^ñ?¿¡/#ªº¬)');

      if (passwordErrors.length > 0) {
        console.log('Validation failed: Password complexity requirements not met:', passwordErrors);
        setError(`Password needs: ${passwordErrors.join(', ')}`);
        return;
      }
      console.log('Password complexity validation passed');

      console.log('=== ALL VALIDATIONS PASSED ===');
      console.log('Setting loading to true...');
      setLoading(true);

      console.log('About to call register function...');
      const result = await register(formData.username, formData.email, formData.password);
      console.log('Register function returned:', result);
      
      if (result.success) {
        console.log('Registration successful! Navigating to dashboard...');
        navigate('/dashboard');
      } else {
        console.error('Registration failed with error:', result.error);
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Caught error during registration:', err);
      setError('Network error. Please try again.');
    } finally {
      console.log('Setting loading to false...');
      setLoading(false);
      console.log('=== FORM SUBMISSION ENDED ===');
    }
  };

  // Add button click handler for additional debugging
  const handleButtonClick = (e) => {
    console.log('=== BUTTON CLICKED ===');
    console.log('Button click event:', e);
    console.log('Current form data:', formData);
    // Don't prevent default here - let the form handle submission
  };

  console.log('Register component rendering with state:', {
    formData: { ...formData, password: '[HIDDEN]', confirmPassword: '[HIDDEN]' },
    error,
    loading,
    hasErrors
  });

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
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
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
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
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
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
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
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
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