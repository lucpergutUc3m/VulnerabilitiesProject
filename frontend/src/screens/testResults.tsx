import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styles from '../css/testResults.module.css';
import { IoMdArrowBack } from "react-icons/io";
import { useTestById } from '../hooks/useTests';

interface ResultsLocationState {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    userAnswers: { [key: number]: number };
}

const TestResults = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { test, loading, error } = useTestById(testId);

    const state = location.state as ResultsLocationState | undefined;
    const score = state?.score ?? 0;
    const correctAnswers = state?.correctAnswers ?? 0;
    const totalQuestions = state?.totalQuestions ?? 0;

    // Determinar baremo según el porcentaje
    const getBaremo = (percentage: number) => {
        if (percentage >= 80) {
            return {
                status: '¡Excelente!',
                message: 'Has dominado este test',
                color: '#10b981',
                emoji: '🎉',
                recommendation: 'Continúa así, eres muy bueno'
            };
        } else if (percentage >= 60) {
            return {
                status: 'Bien',
                message: 'Buen trabajo, pero hay espacio para mejorar',
                color: '#f59e0b',
                emoji: '👍',
                recommendation: 'Repasa los temas que fallaste'
            };
        } else {
            return {
                status: 'Practicar más',
                message: 'Necesitas practicar más para dominar este tema',
                color: '#ef4444',
                emoji: '📚',
                recommendation: 'Revisa la teoría y vuelve a intentar'
            };
        }
    };

    const baremo = getBaremo(score);

    const handleGoBack = () => {
        navigate("/");
    };

    const handleRetakeTest = () => {
        navigate(`/test/${testId}/questions`);
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando resultados...</p>
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
                    <IoMdArrowBack />
                    Volver al inicio
                </button>
            </div>

            <div className={`${styles.testCard} ${styles.resultsCard}`}>
                {/* Emoji y estado */}
                <div className={styles.resultsHeader}>

                    <div>
                        <h2 className={styles.testTitleResults}>{test.title}</h2>
                        <p className={styles.testDescriptionResults}>{baremo.message}</p>
                    </div>
                </div>

                {/* Información del test */}
                <div className={styles.testInfoResults}>
                    <div style={{display:'flex', flexDirection:'row', alignItems:'center',gap:'1rem'}}>
                        <div className={styles.resultEmoji}>{baremo.emoji}</div>
                        <h1 className={styles.resultStatus}>{baremo.status}</h1>
                    </div>
                    <div className={styles.scoreContainer}>
                        <div className={styles.circleWrapper}>
                            <div className={styles.scoreCircle}>
                                <div className={styles.scorePercentage} style={{ color: baremo.color }}>
                                    {score}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Score principal - Grande y prominente */}


                {/* Detalles */}
                <div className={styles.detailsContainer}>
                    <div className={styles.detailItem}>
                        <div className={styles.detailLabel}>Respuestas correctas</div>
                        <div className={styles.detailValue} style={{ color: '#10b981' }}>
                            {correctAnswers} de {totalQuestions}
                        </div>
                    </div>
                    <div className={styles.detailItem}>
                        <div className={styles.detailLabel}>Porcentaje de acierto</div>
                        <div className={styles.detailValue} style={{ color: baremo.color }}>
                            {score}%
                        </div>
                    </div>
                </div>

                {/* Barra de progreso visual */}
                <div className={styles.resultProgressBar}>
                    <div
                        className={styles.resultProgressFill}
                        style={{
                            width: `${score}%`,
                            backgroundColor: baremo.color
                        }}
                    ></div>
                </div>
                {/* Botones de acción */}
                <div className={styles.resultsActions}>
                    <button
                        onClick={handleRetakeTest}
                        className={styles.retakeButton}
                        style={{ backgroundColor: baremo.color }}
                    >
                        Volver a intentar
                    </button>
                    <button
                        onClick={handleGoBack}
                        className={styles.homeButton}
                    >
                        Ir al inicio
                    </button>
                </div>
                {/* Recomendación */}
                <div className={styles.recommendationBox} style={{ borderLeftColor: baremo.color }}>
                    <h3 className={styles.recommendationTitle}>Recomendación</h3>
                    <p className={styles.recommendationText}>{baremo.recommendation}</p>
                </div>

                {/* Sección de Preguntas Respondidas */}
                {state?.userAnswers && Object.keys(state.userAnswers).length > 0 && (
                    <div className={styles.answeredQuestionsSection}>
                        <h3 className={styles.answeredQuestionsTitle}>
                            Detalle de respuestas ({Object.keys(state.userAnswers).length})
                        </h3>
                        <div className={styles.answeredQuestionsContainer}>
                            {test.questions.map((question, qIndex) => {
                                if (!(question.id in state.userAnswers)) return null;

                                const selectedOptionIndex = state.userAnswers[question.id];
                                if (selectedOptionIndex === null) return null;

                                const isCorrect = selectedOptionIndex === question.correctAnswer;

                                return (
                                    <div
                                        key={question.id}
                                        className={`${styles.answeredQuestion} ${isCorrect ? styles.answeredQuestionCorrect : styles.answeredQuestionIncorrect
                                            }`}
                                    >
                                        <div className={styles.answeredQuestionHeader}>
                                            <span className={styles.answeredQuestionNumber}>
                                                Pregunta {qIndex + 1}
                                            </span>
                                            <span className={styles.answerStatus}>
                                                {isCorrect ? '✓ Correcta' : '✗ Incorrecta'}
                                            </span>
                                        </div>

                                        <p className={styles.answeredQuestionText}>
                                            {question.question}
                                        </p>

                                        <div className={styles.answeredOptions}>
                                            <p className={styles.answeredOptionLabel}>
                                                Tu respuesta:
                                            </p>
                                            <div className={styles.answeredOption}>
                                                <span className={styles.answerOptionLetter}>
                                                    {String.fromCharCode(65 + selectedOptionIndex)}
                                                </span>
                                                <span>{question.options[selectedOptionIndex]}</span>
                                            </div>

                                            {!isCorrect && (
                                                <>
                                                    <p className={styles.answeredOptionLabel} style={{ marginTop: '0.75rem' }}>
                                                        Respuesta correcta:
                                                    </p>
                                                    <div className={styles.correctAnswerOption}>
                                                        <span className={styles.answerOptionLetter}>
                                                            {String.fromCharCode(65 + question.correctAnswer)}
                                                        </span>
                                                        <span>{question.options[question.correctAnswer]}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
};

export default TestResults;
