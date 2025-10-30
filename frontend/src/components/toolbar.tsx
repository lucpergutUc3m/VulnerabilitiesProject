import React, { useState } from 'react';
import styles from '../css/toolbar.module.css';
import logoImg from '../assets/images/logo.svg';
// User icon (you can replace with an SVG or image)
const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LoginIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10,17 15,12 10,7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

interface ToolbarProps {
  appName: string;
  onLoginClick: () => void;
  onLogout: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
}

const Toolbar: React.FC<ToolbarProps> = ({ appName, onLoginClick, onLogout, user }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleUserIconClick = () => {
    if (user) {
      setIsUserMenuOpen(!isUserMenuOpen);
    } else {
      onLoginClick();
    }
  };

  const handleUserMenuLogout = () => {
    setIsUserMenuOpen(false);
    onLogout();
  };

  return (
    <header className={styles.toolbar}>
      <div className={styles.toolbarContent}>
        {/* Logo and app name */}
        <div className={styles.logoSection}>
           <div className={styles.logo}>
              <img src={logoImg} alt="Logo" />
            </div>
        </div>
        <h1 className={styles.appName}>{appName}</h1>
        {/* User section/login */}
        <div className={styles.userSection}>
          {user ? (
            <div className={styles.userMenuContainer}>
              <button 
                className={styles.userButton}
                onClick={handleUserIconClick}
                aria-label="User menu"
              >
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className={styles.userAvatar}
                  />
                ) : (
                  <div className={styles.userIcon}>
                    <UserIcon />
                  </div>
                )}
                <span className={styles.userName}>{user.name}</span>
              </button>
              
              {isUserMenuOpen && (
                <div className={styles.userMenu}>
                  <div className={styles.userInfo}>
                    <p className={styles.userEmail}>{user.email}</p>
                  </div>
                  <button 
                    className={`${styles.menuItem} ${styles.logoutItem}`}
                    onClick={handleUserMenuLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className={styles.loginButton}
              onClick={onLoginClick}
              aria-label="Sign in"
            >
              <div className={styles.loginIcon}>
                <LoginIcon />
              </div>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Toolbar;