import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toolbar from './components/toolbar';
import { TestCardList } from './components/testCard';
import { useTests } from './hooks/useTests';
import styles from './css/home.module.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { tests, loading, error } = useTests();
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      try {
        setCurrentUser(JSON.parse(storedUserData));
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, []);

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  const handleUserLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    setCurrentUser(null);

    navigate('/');
  };

  const handleEmojiChange = (testId: number, newEmoji: string) => {
    console.log(`Test ${testId} cambió a emoji: ${newEmoji}`);
    // Aquí puedes actualizar el estado o hacer una llamada API
  };

  const handleAddQuestion = () => {
    // Crear un input file invisible
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            const jsonData = JSON.parse(content);
            console.log('Archivo cargado:', jsonData);
            // Aquí puedes procesar el archivo JSON cargado
            // Por ejemplo, enviar a un backend o actualizar el estado
          } catch (error) {
            console.error('Error al leer el archivo:', error);
            alert('Error: El archivo no es un JSON válido');
          }
        };
        reader.readAsText(file);
      }
    });
    
    // Disparar el click del input file
    fileInput.click();
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
            <div className={styles.containerHeader}>
              <h1 className={styles.containerHeaderTitle}>Tus Test Añadidos</h1>
              <button className={styles.addButton} onClick={handleAddQuestion}>
                <span className={styles.gradientText}>Añadir cuestionario</span>
              </button>
            </div>

            {loading && <p>Cargando tests...</p>}
            {error && <p className={styles.error}>Error: {error}</p>}
            {!loading && !error && (
              <TestCardList tests={tests} onEmojiChange={handleEmojiChange} />
            )}
          </div>
        ) : (
          <div className={styles.loginPrompt}>
            <h2>Sign in to access all features</h2>
            <p>Click the login button in the toolbar.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;