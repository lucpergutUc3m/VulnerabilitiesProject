import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../css/testScreen.module.css';
import { IoMdArrowBack } from "react-icons/io";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
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
                <p>Loading your questions...</p>
            </div>
        );
    }

    if (error || !test) {
        return (
            <div className={styles.errorContainer}>
                <h2>Error</h2>
                <p>{error || 'Test not found'}</p>
                <button onClick={handleGoBack} className={styles.backButton}>
                    Go Back
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
                    Go Back
                </button>
            </div>

            <div className={styles.testCard}>
                {/* Encabezado con progreso */}
                <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                        <h2 className={styles.testTitle}>{test.title}</h2>
                        <span className={styles.progressCounter}>
                            Question {currentQuestionIndex + 1} of {totalQuestions}
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
                        <h3 className={styles.questionText} dangerouslySetInnerHTML={{ __html: currentQuestion.question }} />

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
                                        <span className={styles.optionLetter}>
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <span className={styles.optionText} dangerouslySetInnerHTML={{ __html: option }} />
                                    </button>
                                );
                            })}
                        </div>

                        {/* Explicación */}
                        {isAnswered && currentQuestion.explanation && (
                            <div className={styles.explanationBox}>
                                <h4>Explanation:</h4>
                                <div dangerouslySetInnerHTML={{ __html: currentQuestion.explanation }} />
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
                        <MdNavigateBefore /> Previous
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
                            Next <MdNavigateNext />
                        </button>
                    ) : (
                        <button 
                            onClick={handleFinishTest}
                            className={styles.finishButton}
                            disabled={!isAnswered}
                        >
                            Finish Test
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestScreen;