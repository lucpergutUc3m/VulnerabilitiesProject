import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toolbar from './components/toolbar';
import { TestCardList } from './components/testCard';
import CreateTestModal from './components/createTestModal';
import { useTests } from './hooks/useTests';
import { testService } from './services/testService';
import type { Test } from './services/testService';
import type { User } from './types/auth';
import styles from './css/home.module.css';
import { config } from '@env';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'mine' | 'public'>('mine');
  const { tests, loading, error, refetch } = useTests(viewMode);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [hasLoadedTests, setHasLoadedTests] = useState(false);
  const [showTests, setShowTests] = useState(true);

  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        setCurrentUser(userData);
      } catch {
        setCurrentUser(null);
      }
    }
  }, []);


  useEffect(() => {
    if (currentUser && localStorage.getItem('authToken') && !hasLoadedTests) {
      refetch();
      setHasLoadedTests(true);
    }
  }, [currentUser, hasLoadedTests, refetch]);

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  const handleUserLogout = async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    await fetch(`${config.api.baseUrl}/auth/logout`, { method: 'POST' });

    setCurrentUser(null);
    setHasLoadedTests(false); 

    navigate('/');
  };

  const handleEmojiChange = () => {
    // Placeholder for future implementation
  };

  const handleDelete = async () => {
    await refetch();
  };

  const handleViewModeChange = (newMode: 'mine' | 'public') => {
    if (newMode === viewMode || loading) return;
    
    // Hide current tests first
    setShowTests(false);
    
    // Then change view mode after a brief moment
    setTimeout(() => {
      setViewMode(newMode);
    }, 100);
  };

  // Show tests again when loading completes
  useEffect(() => {
    if (!loading) {
      setShowTests(true);
    }
  }, [loading]);

  const handleAddQuestion = () => {
    setIsModalOpen(true);
  };

  const handleCreateTest = async (testData: Omit<Test, 'id'>) => {
    console.log('Creating test with data:', testData);
    try {
      setSubmitError('');
      await testService.createTest(testData);
      await refetch();
      setIsModalOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating test';
      setSubmitError(errorMessage);
    }
  };


  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className={styles.home}>
      <Toolbar
        appName="QuestionFlow"
        onLoginClick={handleNavigateToLogin}
        onLogout={handleUserLogout}
        user={currentUser}
      />

      <main className={styles.mainContent}>
        {currentUser ? (
          <div className={styles.contentWrapper}>
            <div className={styles.welcomeSection}>
              <div className={styles.welcomeCard}>
                <div className={styles.welcomeIcon}>👋</div>
                <div className={styles.welcomeContent}>
                  <h2 className={styles.welcomeTitle}>
                    {getWelcomeMessage()}, {currentUser.name}!
                  </h2>
                  <p className={styles.welcomeSubtitle}>
                    Manage and take your quizzes in a secure and efficient way. 
                    Create, customize, and track your learning progress.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.containerHeader}>
              <h1 className={styles.containerHeaderTitle}>
                {viewMode === 'mine' ? 'Your Questionnaires' : 'Public Questionnaires'}
              </h1>
              {!loading && !error && tests && tests.length > 0 && viewMode === 'mine' && (
                <button className={styles.addButton} onClick={handleAddQuestion}>
                  <span>+ Create New</span>
                </button>
              )}
            </div>

            {/* Toggle between My Tests and Public Tests */}
            <div className={styles.toggleContainer}>
              <button 
                className={`${styles.toggleButton} ${viewMode === 'mine' ? styles.active : ''}`}
                onClick={() => handleViewModeChange('mine')}
                disabled={loading}
              >
                My Tests
              </button>
              <button 
                className={`${styles.toggleButton} ${viewMode === 'public' ? styles.active : ''}`}
                onClick={() => handleViewModeChange('public')}
                disabled={loading}
              >
                Public Tests
              </button>
            </div>

            {submitError && <p className={styles.error}>{submitError}</p>}
            {(loading || !showTests) && <p className={styles.loadingText}>Loading your questionnaires...</p>}
            {error && showTests && <p className={styles.error}>Error: {error}</p>}
            {!loading && showTests && !error && tests && tests.length > 0 && (
              <TestCardList 
                tests={tests} 
                onEmojiChange={handleEmojiChange}
                onDelete={handleDelete}
                showOwnerActions={viewMode === 'mine'}
              />
            )}
            
            {!loading && showTests && !error && tests && tests.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>📚</div>
                <h3 className={styles.emptyStateTitle}>No Questionnaires Yet</h3>
                <p className={styles.emptyStateDescription}>
                  Start your learning journey by creating your first questionnaire. 
                  It's quick, easy, and completely customizable to fit your needs.
                </p>
                <button className={styles.emptyStateButton} onClick={handleAddQuestion}>
                  <span className={styles.buttonIcon}>✨</span>
                  Create My First Quiz
                </button>
                <div className={styles.emptyStateFooter}>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>⚡</span>
                    <span>Quick Setup</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>🎯</span>
                    <span>Customizable</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>📊</span>
                    <span>Instant Results</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.loginPrompt}>
            <h2>Welcome to QuestionFlow</h2>
            <p>Sign in to create and manage your questionnaires, track your progress, and unlock all features.</p>
          </div>
        )}
      </main>

      {/* Create Test Modal */}
      <CreateTestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTest}
      />
    </div>
  );
};

export default Home;