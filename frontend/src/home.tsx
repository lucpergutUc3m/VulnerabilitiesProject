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
  const { tests, loading, error, refetch } = useTests();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [hasLoadedTests, setHasLoadedTests] = useState(false);

  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, []);

  // Refetch tests when user logs in (only once)
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

    navigate('/');
  };

  const handleEmojiChange = (testId: number, newEmoji: string) => {
    console.log(`Test ${testId} cambió a emoji: ${newEmoji}`);
    // Aquí puedes actualizar el estado o hacer una llamada API
  };

  const handleAddQuestion = () => {
    setIsModalOpen(true);
  };

  const handleCreateTest = async (testData: Omit<Test, 'id'>) => {
    try {
      setSubmitError('');
      await testService.createTest(testData);
      
      // Refrescar la lista de tests
      await refetch();
      
      setIsModalOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el test';
      setSubmitError(errorMessage);
      throw err; // Re-lanzar para que el modal también maneje el error
    }
  };

  return (
    <div className={styles.home}>
      <Toolbar
        appName="Cuestioneo "
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
                    ¡Bienvenido, {currentUser.name}!
                  </h2>
                  <p className={styles.welcomeSubtitle}>
                    Aquí puedes gestionar y realizar tus cuestionarios de manera segura y eficiente.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.containerHeader}>
              <h1 className={styles.containerHeaderTitle}>Tus Test Añadidos</h1>
              {!loading && !error && tests && tests.length > 0 && (
                <button className={styles.addButton} onClick={handleAddQuestion}>
                  <span className={styles.gradientText}>Añadir cuestionario</span>
                </button>
              )}
            </div>

            {submitError && <p className={styles.error}>{submitError}</p>}
            {loading && <p>Cargando tests...</p>}
            {error && <p className={styles.error}>Error: {error}</p>}
            {!loading && !error && tests && tests.length > 0 && (
              <TestCardList tests={tests} onEmojiChange={handleEmojiChange} />
            )}
            
            {!loading && !error && tests && tests.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>📚</div>
                <h3 className={styles.emptyStateTitle}>No tienes tests todavía</h3>
                <p className={styles.emptyStateDescription}>
                  Comienza tu viaje de aprendizaje creando tu primer cuestionario.
                  ¡Es fácil y rápido!
                </p>
                <button className={styles.emptyStateButton} onClick={handleAddQuestion}>
                  <span className={styles.buttonIcon}>✨</span>
                  Crear mi primer test
                </button>
                <div className={styles.emptyStateFooter}>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>⚡</span>
                    <span>Fácil de crear</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>🎯</span>
                    <span>Personalizable</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>📊</span>
                    <span>Resultados al instante</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.loginPrompt}>
            <h2>Sign in to access all features</h2>
            <p>Click the login button in the toolbar.</p>
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