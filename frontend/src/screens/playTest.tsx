import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../css/playTest.module.css';

interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

interface Test {
    id: number;
    title: string;
    topic: string;
    description: string;
    questions: Question[];
    timeLimit?: number;
    createdBy: string;
}

const TestStartPage = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const mockTest: Test = {
                    id: 1,
                    title: "Historia del Arte Renacentista",
                    topic: "Arte",
                    description: "Test completo sobre los principales artistas y obras del Renacimiento italiano",
                    questions: [
                        {
                            id: 1,
                            question: "¿Quién pintó la Capilla Sixtina?",
                            options: ["Leonardo da Vinci", "Miguel Ángel", "Rafael", "Donatello"],
                            correctAnswer: 1,
                            explanation: "Miguel Ángel pintó la bóveda de la Capilla Sixtina entre 1508 y 1512."
                        },
                        {
                            id: 2,
                            question: "¿Cuál es la obra más famosa de Leonardo da Vinci?",
                            options: ["La Última Cena", "La Gioconda", "El Hombre de Vitruvio", "Todas las anteriores"],
                            correctAnswer: 3,
                            explanation: "Todas son obras extremadamente famosas de Leonardo da Vinci."
                        }
                    ]
                };
                setTest(mockTest);
            } catch (err) {
                setError('Error al cargar el test');
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, [testId]);

    const handleStartTest = () => {
        navigate(`/test/${testId}/play`);
    };

    const handleGoBack = () => {
        navigate("/");
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando test...</p>
            </div>
        );
    }

    if (error || !test) {
        return (
            <div className={styles.errorContainer}>
                <h2>Error</h2>
                <p>{error || 'Test no encontrado'}</p>
                <button onClick={handleGoBack} className={styles.backButton}>
                    Volver atrás
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.backButtonContainer}>
                <button onClick={handleGoBack} className={styles.backButton}>
                    ← Volver al inicio
                </button>
            </div>

            <div className={styles.testCard}>
                <div className={styles.testHeader}>
                    <div className={styles.emojiSection}>
                        <span className={styles.testEmoji}>🎨</span>
                    </div>
                    <div className={styles.testInfo}>
                        <div className={styles.topicBadge}>
                            {test.topic}
                        </div>
                        <h1 className={styles.testTitle}>{test.title}</h1>
                        <p className={styles.testDescription}>{test.description}</p>
                        <div className={styles.detailText}>
                            <span className={styles.questionIcon}>📝</span>
                            <strong>{test.questions.length}</strong>
                            <span>preguntas</span>
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button
                        onClick={handleStartTest}
                        className={styles.startButton}
                    >
                        <span className={styles.buttonIcon}>🚀</span>
                        Comenzar Test
                    </button>
                    <button
                        onClick={handleGoBack}
                        className={styles.cancelButton}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestStartPage;