import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../css/playTest.module.css';
import { IoMdArrowBack } from "react-icons/io";
import { useTestById } from '../hooks/useTests';

interface UserAnswers {
    [questionId: number]: number | null;
}

const TestScreen = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();
    const { test, loading, error } = useTestById(testId);
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
    const [isAnswered, setIsAnswered] = useState(false);

    // Validar que testId exista
    useEffect(() => {
        if (!testId) {
            navigate("/");
        }
    }, [testId, navigate]);

    const handleGoBack = () => {
        navigate(`/`);
    };

    const handleAnswerClick = (optionIndex: number) => {
        if (!isAnswered && test) {
            const currentQuestion = test.questions[currentQuestionIndex];
            setUserAnswers({
                ...userAnswers,
                [currentQuestion.id]: optionIndex
            });
            setIsAnswered(true);
        }
    };

    const handleNextQuestion = () => {
        if (test && currentQuestionIndex < test.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setIsAnswered(false);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            const currentQuestion = test!.questions[currentQuestionIndex - 1];
            setIsAnswered(currentQuestion.id in userAnswers);
        }
    };

    const handleFinishTest = () => {
        // Calcular puntuación
        let correctAnswers = 0;
        if (test) {
            test.questions.forEach((question) => {
                if (userAnswers[question.id] === question.correctAnswer) {
                    correctAnswers++;
                }
            });
        }
        
        // Guardar resultados y navegar
        const score = test ? Math.round((correctAnswers / test.questions.length) * 100) : 0;
        navigate(`/test/${testId}/results`, { 
            state: { 
                score, 
                correctAnswers, 
                totalQuestions: test?.questions.length,
                userAnswers 
            } 
        });
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando preguntas...</p>
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

    const currentQuestion = test.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === test.questions.length - 1;
    const totalQuestions = test.questions.length;
    const selectedAnswer = userAnswers[currentQuestion.id];

    return (
        <div className={styles.container}>
            <div className={styles.backButtonContainer}>
                <button onClick={handleGoBack} className={styles.backButton}>
                    <IoMdArrowBack />
                    Volver al inicio
                </button>
            </div>

            <div className={styles.testCard}>
                {/* Encabezado con progreso */}
                <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                        <h2 className={styles.testTitle}>{test.title}</h2>
                        <span className={styles.progressCounter}>
                            Pregunta {currentQuestionIndex + 1} de {totalQuestions}
                        </span>
                    </div>
                    
                    <div className={styles.progressBar}>
                        <div 
                            className={styles.progressFill}
                            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Pregunta Actual */}
                <div className={styles.questionSection}>
                    <div className={styles.questionContainer}>
                        <h3 className={styles.questionText}>
                            {currentQuestion.question}
                        </h3>

                        {/* Opciones de respuesta */}
                        <div className={styles.optionsContainer}>
                            {currentQuestion.options.map((option, index) => {
                                const isCorrect = index === currentQuestion.correctAnswer;
                                const isSelected = selectedAnswer === index;
                                
                                let optionClassName = styles.option;
                                
                                if (isAnswered) {
                                    if (isCorrect) {
                                        optionClassName = `${styles.option} ${styles.correct}`;
                                    } else if (isSelected && !isCorrect) {
                                        optionClassName = `${styles.option} ${styles.incorrect}`;
                                    }
                                }
                                
                                if (isSelected && !isAnswered) {
                                    optionClassName = `${styles.option} ${styles.selected}`;
                                }

                                return (
                                    <button
                                        key={index}
                                        className={optionClassName}
                                        onClick={() => handleAnswerClick(index)}
                                        disabled={isAnswered}
                                    >
                                        <span className={styles.optionLabel}>
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <span className={styles.optionText}>{option}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Explicación */}
                        {isAnswered && currentQuestion.explanation && (
                            <div className={styles.explanationBox}>
                                <h4>Explicación:</h4>
                                <p>{currentQuestion.explanation}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Botones de navegación */}
                <div className={styles.navigationButtons}>
                    <button 
                        onClick={handlePreviousQuestion}
                        className={styles.prevButton}
                        disabled={currentQuestionIndex === 0}
                    >
                        ← Anterior
                    </button>

                    <div className={styles.questionIndicators}>
                        {test.questions.map((_, index) => (
                            <div
                                key={index}
                                className={`${styles.indicator} ${
                                    index === currentQuestionIndex ? styles.active : ''
                                } ${
                                    index in userAnswers ? styles.answered : ''
                                }`}
                            ></div>
                        ))}
                    </div>

                    {!isLastQuestion ? (
                        <button 
                            onClick={handleNextQuestion}
                            className={styles.nextButton}
                            disabled={!isAnswered}
                        >
                            Siguiente →
                        </button>
                    ) : (
                        <button 
                            onClick={handleFinishTest}
                            className={styles.finishButton}
                            disabled={!isAnswered}
                        >
                            Terminar Test
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestScreen;