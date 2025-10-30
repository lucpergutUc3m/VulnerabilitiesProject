import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toolbar from './components/toolbar';
import { TestCardList } from './components/testCard';
import styles from './css/home.module.css';
const Home: React.FC = () => {
  const navigate = useNavigate();
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
  const mockTests = [
    {
      id: 1,
      title: "Historia del Arte Renacentista",
      topic: "Arte",
      description: "Test completo sobre los principales artistas y obras del Renacimiento italiano y su influencia en Europa.",
      questionsCount: 15,
      createdAt: "2024-01-15",
      emoji: "🎨"
    },
    {
      id: 2,
      title: "Fundamentos de JavaScript",
      topic: "Programación",
      description: "Evaluación de conceptos básicos de JavaScript incluyendo funciones, arrays y objetos.",
      questionsCount: 20,
      createdAt: "2024-01-10",
      emoji: "💻"
    },
    {
      id: 3,
      title: "Biología Celular",
      topic: "Ciencias",
      description: "Estudio profundo de la estructura y función de las células, incluyendo procesos metabólicos.",
      questionsCount: 18,
      createdAt: "2024-01-12",
      emoji: "🧬"
    },
    {
      id: 4,
      title: "Historia Medieval Europea",
      topic: "Historia",
      description: "Test sobre los períodos Medieval y Feudal en Europa, sus características políticas y sociales.",
      questionsCount: 25,
      createdAt: "2024-01-08",
      emoji: "🏰"
    },
    {
      id: 5,
      title: "Matemáticas Avanzadas",
      topic: "Matemáticas",
      description: "Conceptos de cálculo integral, derivadas y aplicaciones en problemas reales.",
      questionsCount: 30,
      createdAt: "2024-01-05",
      emoji: "🔢"
    },
    {
      id: 6,
      title: "Geografía Política",
      topic: "Geografía",
      description: "Análisis de fronteras, geopolítica y división de estados en el mundo actual.",
      questionsCount: 22,
      createdAt: "2024-01-02",
      emoji: "🌍"
    }
  ];

  const handleEmojiChange = (testId: number, newEmoji: string) => {
    console.log(`Test ${testId} cambió a emoji: ${newEmoji}`);
    // Aquí puedes actualizar el estado o hacer una llamada API
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
        <div className={styles.container}>
          {currentUser ? (
            <div className={styles.mainContent}>
              <div className={styles.containerHeader}>
                <h1 className={styles.containerHeaderTitle}>Tus Test Añadidos</h1>
                <button className={styles.addButton}>
                  <span className={styles.gradientText}>Añadir pregunta</span>
                </button>
              </div>

              <div className={styles.container} >
                <TestCardList tests={mockTests} onEmojiChange={handleEmojiChange} />
              </div>


            </div>
          ) : (
            <div className={styles.loginPrompt}>
              <h2>Sign in to access all features</h2>
              <p>Click the login button in the toolbar.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;