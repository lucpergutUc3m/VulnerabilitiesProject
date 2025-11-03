import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { config } from '@env';
import type { User } from '../types/auth';
import styles from '../css/userProfile.module.css';
import TestCardListAdmin from '@/components/testCardAdmin';
import { FaHome, FaUserShield, FaUserLock, FaUser, FaClipboardList, FaFileAlt } from 'react-icons/fa';

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
  const [userTests, setUserTests] = useState<TestItem[]>([]);
  const [testsLoading, setTestsLoading] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      const user = authService.getUser();
      
      console.log('🔍 Loading user:', user);
      
      if (!user) {
        console.error('❌ No user found, redirecting to login');
        setError('No user session found');
        navigate('/login', { replace: true });
        return;
      }

      console.log('✅ User loaded successfully:', user.email, 'Role:', user.role);
      setUser(user);
      setEditedName(user.name);
      setIsLoading(false);
    };

    loadUser();
  }, [navigate]);

  // Segundo useEffect para cargar tests (admin o usuario)
  useEffect(() => {
    const fetchTests = async () => {
      if (!user) {
        return;
      }

      setTestsLoading(true);
      try {
        const authHeader = authService.getAuthHeader();
        let endpoint = '';
        
        // Si es admin, usar endpoint de admin
        if (authService.isAdmin()) {
          const payload = authService.getTokenPayload();
          if (payload) {
            console.log('Token payload:', payload);
            console.log('Token authorities:', payload.authorities);
            console.log('Token role:', payload.role);
          }
          
          endpoint = `${config.api.baseUrl}/admin/tests`;
        } else {
          // Si es usuario normal, obtener sus tests
          endpoint = `${config.api.baseUrl}/tests/user/${user.id}`;
        }
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader
          }
        });
        
        console.log('Tests response status:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error ${response.status}: ${response.statusText}`, errorText);
          // No establecer error general, solo log
          console.warn('Could not load tests, but continuing...');
          if (authService.isAdmin()) {
            setAdminTests([]);
          } else {
            setUserTests([]);
          }
          return;
        }

        const data = await response.json();
        console.log('Tests data:', data);
        
        if (authService.isAdmin()) {
          setAdminTests(data);
        } else {
          setUserTests(data);
        }
      } catch (e) {
        console.error('Failed to fetch tests:', e);
        // No establecer error general, solo establecer array vacío
        if (authService.isAdmin()) {
          setAdminTests([]);
        } else {
          setUserTests([]);
        }
      } finally {
        setTestsLoading(false);
      }
    };

    fetchTests();
  }, [user]); // Se ejecuta cuando user cambia

  const handleTestDeleted = () => {
    // Recargar la lista de tests después de que uno se borre
    if (!user) return;
    
    const authHeader = authService.getAuthHeader();
    let endpoint = '';
    
    if (authService.isAdmin()) {
      endpoint = `${config.api.baseUrl}/admin/tests`;
    } else {
      endpoint = `${config.api.baseUrl}/tests/user/${user.id}`;
    }
    
    fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('Tests reloaded after deletion:', data);
        if (authService.isAdmin()) {
          setAdminTests(data);
        } else {
          setUserTests(data);
        }
      })
      .catch(e => {
        console.error('Failed to reload tests:', e);
      });
  };

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

      const response = await fetch(`${config.api.baseUrl}/users/me`, {
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
    console.log('⏳ Profile is loading...');
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

  console.log('✅ Rendering profile for user:', user?.email, 'Role:', user?.role);

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
                      onClick={() => navigate('/')}
                      className={`${styles.button} ${styles.buttonSmall} ${styles.buttonHome}`}
                    >
                      <FaHome /> Home
                    </button>
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
                    {user.role === 1 ? (
                      <><FaUserShield style={{ marginRight: '0.5rem' }} /> Admin</>
                    ) : user.role === 2 ? (
                      <><FaUserLock style={{ marginRight: '0.5rem' }} /> Superuser</>
                    ) : (
                      <><FaUser style={{ marginRight: '0.5rem' }} /> User</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Admin Tests Section - Only show for admins */}
          {user && user.role === 1 && (
            <div className={styles.profileSection}>
              <h2 className={styles.sectionTitle}>
                <FaClipboardList style={{ marginRight: '0.5rem' }} /> Admin Tests
              </h2>
              
              {testsLoading ? (
                <p className={styles.loadingMessage}>Loading tests...</p>
              ) : adminTests.length > 0 ? (
                <TestCardListAdmin 
                  tests={adminTests.map(test => ({
                    ...test,
                    emoji: test.emoji || '📚',
                    questions: test.questions || (test.questionsJson ? JSON.parse(test.questionsJson) : [])
                  }))} 
                  onEmojiChange={() => {}}
                  onTestDeleted={handleTestDeleted}
                />
              ) : (
                <p className={styles.noTests}>No tests available</p>
              )}
            </div>
          )}

          {/* User Tests Section - Only show for non-admin users */}
          {user && user.role !== 1 && (
            <div className={styles.profileSection}>
              <h2 className={styles.sectionTitle}>
                <FaFileAlt style={{ marginRight: '0.5rem' }} /> My Tests
              </h2>
              
              {testsLoading ? (
                <p className={styles.loadingMessage}>Loading tests...</p>
              ) : userTests.length > 0 ? (
                <TestCardListAdmin 
                  tests={userTests.map(test => ({
                    ...test,
                    emoji: test.emoji || '📚',
                    questions: test.questions || (test.questionsJson ? JSON.parse(test.questionsJson) : [])
                  }))} 
                  onEmojiChange={() => {}}
                  onTestDeleted={handleTestDeleted}
                />
              ) : (
                <p className={styles.noTests}>You haven't created any tests yet</p>
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
