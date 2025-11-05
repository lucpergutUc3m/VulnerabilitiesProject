import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RegisterForm from '../components/registerForm';
import type { RegisterFormData, RegisterResponse } from '../types/register';
import { config } from '@env';
import logoImg from '../assets/images/logo.svg';
import styles from '../css/registerPage.module.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string>('');

  const handleRegisterAttempt = async (formData: RegisterFormData) => {
    setIsAuthLoading(true);
    setAuthErrorMessage('');

    try {
 
      const response = await fetch(`${config.api.baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Registration failed with status: ${response.status}`);
      }


      const authResponse: RegisterResponse = await response.json();


      localStorage.setItem('authToken', authResponse.token);
      localStorage.setItem('user', JSON.stringify(authResponse.user));


      navigate('/', { replace: true });
      
    } catch (error) {
      if (error instanceof Error) {
        setAuthErrorMessage(error.message);
      } else {
        setAuthErrorMessage('Registration failed. Please try again.');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <div className={styles.registerPage}>
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
            <h1 className={styles.title}>Create Account</h1>
            <p className={styles.subtitle}>
              Join us today and start your journey
            </p>
          </div>

          <RegisterForm 
            onSubmit={handleRegisterAttempt}
            isLoading={isAuthLoading}
            error={authErrorMessage}
          />

          {/* Link to login */}
          <div className={styles.footer}>
            <p className={styles.footerText}>
              Already have an account?{' '}
              <Link to="/login" className={styles.link}>
                Sign in
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
