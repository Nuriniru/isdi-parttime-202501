import { useState, useCallback } from 'react';
import { validator, errors } from 'common';

export const useValidation = () => {
  const [validationErrors, setValidationErrors] = useState({});

  const validateField = useCallback((fieldName, value, validationType = 'default') => {
    try {
      let isValid = true;
      let errorMessage = '';

      switch (validationType) {
        case 'email':
          validator.email(value);
          break;
        case 'password':
          validator.passwordSecurity(value);
          break;
        case 'id':
          validator.id(value);
          break;
        case 'required':
          if (!value || value.trim() === '') {
            throw new errors.ValidationError('This field is required');
          }
          break;
        case 'passwordMatch':
          if (value.password !== value.confirmPassword) {
            throw new errors.ValidationError('Passwords do not match');
          }
          break;
        default:
          // For custom validation, just check if value exists
          if (!value || value.trim() === '') {
            throw new errors.ValidationError('This field is required');
          }
      }

      // Clear error if validation passes
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });

      return { isValid: true, error: null };
    } catch (error) {
      let errorMessage = 'Validation failed';
      
      if (error instanceof errors.FormatError) {
        errorMessage = error.message || 'Invalid format';
      } else if (error instanceof errors.ValidationError) {
        errorMessage = error.message || 'Validation error';
      } else if (error instanceof errors.ExistenceError) {
        errorMessage = error.message || 'Resource not found';
      } else if (error instanceof errors.AuthError) {
        errorMessage = error.message || 'Authentication error';
      } else {
        errorMessage = error.message || 'Unknown error';
      }

      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: errorMessage
      }));

      return { isValid: false, error: errorMessage };
    }
  }, []);

  const validateForm = useCallback((formData, validationRules) => {
    const errors = {};
    let isFormValid = true;

    Object.entries(validationRules).forEach(([fieldName, rules]) => {
      const value = formData[fieldName];
      
      // Handle array of validation rules
      if (Array.isArray(rules)) {
        for (const rule of rules) {
          const result = validateField(fieldName, value, rule);
          if (!result.isValid) {
            errors[fieldName] = result.error;
            isFormValid = false;
            break; // Stop at first error
          }
        }
      } else {
        // Handle single validation rule
        const result = validateField(fieldName, value, rules);
        if (!result.isValid) {
          errors[fieldName] = result.error;
          isFormValid = false;
        }
      }
    });

    setValidationErrors(errors);
    return { isValid: isFormValid, errors };
  }, [validateField]);

  const clearErrors = useCallback((fieldNames = null) => {
    if (fieldNames) {
      // Clear specific fields
      const fieldsArray = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        fieldsArray.forEach(field => delete newErrors[field]);
        return newErrors;
      });
    } else {
      // Clear all errors
      setValidationErrors({});
    }
  }, []);

  const hasErrors = Object.keys(validationErrors).length > 0;
  const getError = useCallback((fieldName) => validationErrors[fieldName], [validationErrors]);

  return {
    validationErrors,
    validateField,
    validateForm,
    clearErrors,
    hasErrors,
    getError
  };
};