import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import LoginForm from '../components/loginForm';
import type { LoginFormData, AuthResponse } from '../types/auth';
import { config } from '@env';
import logoImg from '../assets/images/logo.svg';
import styles from '../css/loginPage.module.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string>('');

  // Get the page to redirect to after login
  const redirectPathAfterLogin = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/';

  const handleLoginAttempt = async (formData: LoginFormData) => {
    setIsAuthLoading(true);
    setAuthErrorMessage('');

    try {
      // Log configuration for debugging
      if (config.app.debug) {
        console.log('API Base URL:', config.api.baseUrl);
        console.log('App Name:', config.app.name);
        console.log('Environment:', config.app.environment);
      }
      
      // Make real API call to backend
      const response = await fetch(`${config.api.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid credentials. Please verify your email and password.');
      }

      // Parse the response
      const authResponse: AuthResponse = await response.json();

      // Save to localStorage
      localStorage.setItem('authToken', authResponse.token);
      localStorage.setItem('user', JSON.stringify(authResponse.user));

      // Redirect to previous page or home
      navigate(redirectPathAfterLogin, { replace: true });
      
    } catch (error) {
      if (error instanceof Error) {
        setAuthErrorMessage(error.message);
      } else {
        setAuthErrorMessage('Invalid credentials. Please verify your email and password.');
      }
      console.error('Login error:', error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.background}>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
      </div>
      
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Logo and welcome */}
          <div className={styles.header}>
            <div className={styles.logo}>
              <img src={logoImg} alt="Logo" />
            </div>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>
              Sign in to your account to continue
            </p>
          </div>

          <LoginForm 
            onSubmit={handleLoginAttempt}
            isLoading={isAuthLoading}
            error={authErrorMessage}
          />

          {/* Link to register */}
          <div className={styles.footer}>
            <p className={styles.footerText}>
              Don't have an account?{' '}
              <Link to="/register" className={styles.link}>
                Create one
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
