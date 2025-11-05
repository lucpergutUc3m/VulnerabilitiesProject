import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import LoginForm from '../components/loginForm';
import type { LoginFormData } from '../types/auth';
import authService from '../services/authService';
import logoImg from '../assets/images/logo.svg';
import styles from '../css/loginPage.module.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string>('');


  const redirectPathAfterLogin = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/';

  const handleLoginAttempt = async (formData: LoginFormData) => {
    setIsAuthLoading(true);
    setAuthErrorMessage('');

    try {

      await authService.login(formData.email, formData.password);
      

      navigate(redirectPathAfterLogin, { replace: true });
      
    } catch (error) {
      if (error instanceof Error) {
        setAuthErrorMessage(error.message);
      } else {
        setAuthErrorMessage('Invalid credentials. Please verify your email and password.');
      }
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
