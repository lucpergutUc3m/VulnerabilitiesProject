import React, { useState } from 'react';
import type { LoginFormData } from '../types/auth';
import styles from '../css/loginform.module.css';

interface LoginFormProps {
  onSubmit: (formData: LoginFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false, error = '' }) => {
  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(loginFormData);
  };

  return (
    <form className={styles.form} onSubmit={handleFormSubmit}>
      {error && <div className={styles.error}>{error}</div>}
      
      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={loginFormData.email}
          onChange={handleInputChange}
          className={styles.input}
          placeholder="your@email.com"
          required
          disabled={isLoading}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.label}>Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={loginFormData.password}
          onChange={handleInputChange}
          className={styles.input}
          placeholder="••••••••"
          required
          disabled={isLoading}
        />
      </div>

      <button 
        type="submit" 
        className={styles.button}
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};

export default LoginForm;
