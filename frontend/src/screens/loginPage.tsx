import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log configuration for debugging
      if (config.app.debug) {
        console.log('API Base URL:', config.api.baseUrl);
        console.log('App Name:', config.app.name);
        console.log('Environment:', config.app.environment);
      }
      
      // En producción usarías:
      // const response = await fetch(`${config.api.baseUrl}/auth/login`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
    
      // Successful response simulation
      const mockAuthResponse: AuthResponse = {
        user: {
          id: '1',
          name: 'John Doe',
          email: formData.email
        },
        token: 'mock-jwt-token',
        expiresIn: 3600
      };

      // Save to localStorage
      localStorage.setItem('authToken', mockAuthResponse.token);
      localStorage.setItem('user', JSON.stringify(mockAuthResponse.user));

      // Redirect to previous page or home
      navigate(redirectPathAfterLogin, { replace: true });
      
    } catch (error) {
      setAuthErrorMessage('Invalid credentials. Please verify your email and password.');
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
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
