import React, { useState } from 'react';
import type { RegisterFormData } from '../types/register';
import styles from '../css/registerForm.module.css';

interface RegisterFormProps {
  onSubmit: (formData: RegisterFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading = false, error = '' }) => {
  const [registerFormData, setRegisterFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field
    setValidationErrors(prev => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    if (registerFormData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerFormData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (registerFormData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (registerFormData.password !== registerFormData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(registerFormData);
  };

  return (
    <form className={styles.form} onSubmit={handleFormSubmit}>
      {error && <div className={styles.error}>{error}</div>}
      
      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>Full Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={registerFormData.name}
          onChange={handleInputChange}
          className={styles.input}
          placeholder="John Doe"
          required
          disabled={isLoading}
        />
        {validationErrors.name && (
          <span className={styles.fieldError}>{validationErrors.name}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={registerFormData.email}
          onChange={handleInputChange}
          className={styles.input}
          placeholder="your@email.com"
          required
          disabled={isLoading}
        />
        {validationErrors.email && (
          <span className={styles.fieldError}>{validationErrors.email}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.label}>Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={registerFormData.password}
          onChange={handleInputChange}
          className={styles.input}
          placeholder="••••••••"
          required
          disabled={isLoading}
        />
        {validationErrors.password && (
          <span className={styles.fieldError}>{validationErrors.password}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={registerFormData.confirmPassword}
          onChange={handleInputChange}
          className={styles.input}
          placeholder="••••••••"
          required
          disabled={isLoading}
        />
        {validationErrors.confirmPassword && (
          <span className={styles.fieldError}>{validationErrors.confirmPassword}</span>
        )}
      </div>

      <button 
        type="submit" 
        className={styles.button}
        disabled={isLoading}
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
};

export default RegisterForm;
