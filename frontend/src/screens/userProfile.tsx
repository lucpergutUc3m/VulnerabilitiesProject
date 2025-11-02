import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from '@env';
import type { User } from '../types/auth';
import logoImg from '../assets/images/logo.svg';
import styles from '../css/userProfile.module.css';

interface TestItem {
  id: number;
  title: string;
  description: string;
  topic?: string;
  ownerId?: number;
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [adminTests, setAdminTests] = useState<TestItem[]>([]);
  const [testsLoading, setTestsLoading] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('authToken');

      if (!userStr || !token) {
        setError('No user session found');
        navigate('/login', { replace: true });
        return;
      }

      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setEditedName(userData.name);
        setIsLoading(false);
      } catch {
        setError('Failed to load user data');
        setIsLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  // Segundo useEffect solo para cargar tests de admin
  useEffect(() => {
    const fetchTestAdmin = async () => {
      if (!user || user.role !== 1) {
        return; // Solo si es admin (role === 1)
      }

      setTestsLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.warn('No authentication token found');
          return;
        }

        const response = await fetch(`${config.api.baseUrl}/admin/tests`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          console.error(`Error ${response.status}: ${response.statusText}`);
          return;
        }

        const data = await response.json();
        console.log('Admin tests data:', data);
        setAdminTests(data);
      } catch (e) {
        console.error('Failed to fetch tests:', e);
        setError('Unable to fetch admin tests');
      } finally {
        setTestsLoading(false);
      }
    };

    fetchTestAdmin();
  }, [user]); // Se ejecuta cuando user cambia

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const handleUpdateProfile = async () => {
    if (!user || !editedName.trim()) {
      setError('Name cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`${config.api.baseUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editedName })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUser = { ...user, name: editedName };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      setError('');
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Failed to update profile');
      }
    }
  };

  if (isLoading) {
    return (
      <div className={styles.userProfilePage}>
        <div className={styles.background}>
          <div className={styles.shape}></div>
          <div className={styles.shape}></div>
        </div>
        <div className={styles.container}>
          <div className={styles.content}>
            <p className={styles.loadingMessage}>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.userProfilePage}>
      <div className={styles.background}>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.logo}>
              <img src={logoImg} alt="Logo" />
            </div>
            <h1 className={styles.title}>My Profile</h1>
            <p className={styles.subtitle}>
              Manage your account information
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {/* Profile Information */}
          {user && (
            <div className={styles.profileSection}>
              {/* User Info Display */}
              <div className={styles.infoBox}>
                <div className={styles.infoBoxWithMargin}>
                  <label className={styles.label}>
                    Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className={styles.input}
                    />
                  ) : (
                    <p className={styles.text}>
                      {user.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className={styles.label}>
                    Email
                  </label>
                  <p className={styles.text}>
                    {user.email}
                  </p>
                </div>
              </div>

              {/* User ID (read-only) */}
              <div className={styles.infoBox}>
                <label className={styles.label}>
                  User ID
                </label>
                <p className={styles.textSmall}>
                  {user.id}
                </p>
              </div>

              {/* User Role */}
              <div className={styles.infoBox}>
                <label className={styles.label}>
                  Role
                </label>
                <p className={styles.text}>
                  {user.role === 1 ? '👨‍💼 Admin' : user.role === 2 ? '🔐 Superuser' : '👤 User'}
                </p>
              </div>
            </div>
          )}

          {/* Admin Tests Section - Only show for admins */}
          {user && user.role === 1 && (
            <div className={styles.profileSection}>
              <h2 className={styles.sectionTitle}>📋 Admin Tests</h2>
              
              {testsLoading ? (
                <p className={styles.loadingMessage}>Loading tests...</p>
              ) : adminTests.length > 0 ? (
                <div className={styles.testsList}>
                  {adminTests.map((test: TestItem) => (
                    <div key={test.id} className={styles.testCard}>
                      <div className={styles.testCardHeader}>
                        <h3 className={styles.testTitle}>{test.title}</h3>
                        <span className={styles.testId}>ID: {test.id}</span>
                      </div>
                      <p className={styles.testDescription}>{test.description}</p>
                      {test.topic && (
                        <p className={styles.testTopic}>📚 Topic: {test.topic}</p>
                      )}
                      <p className={styles.testOwner}>Owner ID: {test.ownerId}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.noTests}>No tests available</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.buttonContainer}>
            {isEditing ? (
              <>
                <button
                  onClick={handleUpdateProfile}
                  className={`${styles.button} ${styles.buttonPrimary}`}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedName(user?.name || '');
                    setError('');
                  }}
                  className={`${styles.button} ${styles.buttonSecondary}`}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`${styles.button} ${styles.buttonPrimary}`}
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className={`${styles.button} ${styles.buttonSecondary}`}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
