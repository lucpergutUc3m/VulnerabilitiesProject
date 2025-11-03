import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { config } from '@env';
import type { User } from '../types/auth';
import styles from '../css/userProfile.module.css';
import { TestCardList } from '../components/testCard';

interface TestItem {
  id: number;
  title: string;
  description: string;
  topic?: string;
  ownerId?: number;
  emoji?: string;
  questionsJson?: string;
  questions?: Record<string, unknown>[];
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
      const user = authService.getUser();
      
      if (!user) {
        setError('No user session found');
        navigate('/login', { replace: true });
        return;
      }

      setUser(user);
      setEditedName(user.name);
      setIsLoading(false);
    };

    loadUser();
  }, [navigate]);

  // Segundo useEffect solo para cargar tests de admin
  useEffect(() => {
    const fetchTestAdmin = async () => {
      if (!user || !authService.isAdmin()) {
        return; // Solo si es admin
      }

      setTestsLoading(true);
      try {
        // Debug: Show token info
        const payload = authService.getTokenPayload();
        if (payload) {
          console.log('Token payload:', payload);
          console.log('Token authorities:', payload.authorities);
          console.log('Token role:', payload.role);
        }

        // Get auth header
        const authHeader = authService.getAuthHeader();
        
        const response = await fetch(`${config.api.baseUrl}/admin/tests`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader
          }
        });
        
        console.log('Admin tests response status:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error ${response.status}: ${response.statusText}`, errorText);
          setError(`Failed to fetch admin tests: ${response.status} ${response.statusText}`);
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

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login', { replace: true });
  };

  const handleUpdateProfile = async () => {
    if (!user || !editedName.trim()) {
      setError('Name cannot be empty');
      return;
    }

    try {
      const token = authService.getToken();
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
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
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
            <div className={styles.scrollableContent}>
              <p className={styles.loadingMessage}>Loading profile...</p>
            </div>
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
            <div className={styles.headerContent}>
              <div>
                <h1 className={styles.title}>My Profile</h1>
                <p className={styles.subtitle}>
                  Manage your account information
                </p>
              </div>
              <div className={styles.headerButtons}>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleUpdateProfile}
                      className={`${styles.button} ${styles.buttonSmall} ${styles.buttonPrimary}`}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedName(user?.name || '');
                        setError('');
                      }}
                      className={`${styles.button} ${styles.buttonSmall} ${styles.buttonSecondary}`}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`${styles.button} ${styles.buttonSmall} ${styles.buttonPrimary}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleLogout}
                      className={`${styles.button} ${styles.buttonSmall} ${styles.buttonLogout}`}
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={styles.scrollableContent}>
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
                <div className={styles.infoField}>
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

                <div className={styles.infoField}>
                  <label className={styles.label}>
                    Email
                  </label>
                  <p className={styles.text}>
                    {user.email}
                  </p>
                </div>
              </div>

              {/* User ID and Role - Same row */}
              <div className={styles.infoBox}>
                <div className={styles.infoField}>
                  <label className={styles.label}>
                    User ID
                  </label>
                  <p className={styles.textSmall}>
                    {user.id}
                  </p>
                </div>

                <div className={styles.infoField}>
                  <label className={styles.label}>
                    Role
                  </label>
                  <p className={styles.text}>
                    {user.role === 1 ? '👨‍💼 Admin' : user.role === 2 ? '🔐 Superuser' : '👤 User'}
                  </p>
                </div>
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
                <TestCardList 
                  tests={adminTests.map(test => ({
                    ...test,
                    emoji: test.emoji || '📚',
                    questions: test.questions || (test.questionsJson ? JSON.parse(test.questionsJson) : [])
                  }))} 
                  onEmojiChange={() => {}} 
                />
              ) : (
                <p className={styles.noTests}>No tests available</p>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
