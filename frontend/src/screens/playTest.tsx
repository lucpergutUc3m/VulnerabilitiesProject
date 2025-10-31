import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from '../css/playTest.module.css';
import { VscDebugStart } from "react-icons/vsc";
import { IoMdArrowBack } from "react-icons/io";
import { useTestById } from '../hooks/useTests';
import type { Question } from '../services/testService';
import { MdEdit } from "react-icons/md";

interface LocationState {
    showQuestions?: boolean;
    questions?: Question[];
}

const TestStartPage = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { test, loading, error } = useTestById(testId);
    
    // Obtener el estado de navegación para ver si se deben mostrar preguntas
    const state = location.state as LocationState;
    const showQuestions = state?.showQuestions || false;
    const stateQuestions = state?.questions || [];

    const handleStartTest = () => {
        navigate(`/test/${testId}/questions`);
    };

    const handleGoBack = () => {
        navigate("/");
    };

    const handleEditClick = () => {
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

    const questionsToShow = showQuestions && stateQuestions.length > 0 ? stateQuestions : null;

    return (
        <div className={styles.container}>
            <div className={styles.backButtonContainer}>
                <button onClick={handleGoBack} className={styles.backButton}>
                    <IoMdArrowBack />
                    Volver al inicio
                </button>
            </div>

            <div className={styles.testCard}>
                <div className={styles.testHeader}>
                    <div className={styles.emojiSection}>
                        <span className={styles.testEmoji}>{test.emoji}</span>
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
                    <button
                        onClick={handleEditClick}
                        className={styles.editButton}
                    >
                        <span className={styles.buttonIcon}>
                            <MdEdit />
                        </span>
                        Editar
                    </button>
                    <button
                        onClick={handleStartTest}
                        className={styles.startButton}
                    >
                        <span className={styles.buttonIcon}>
                            <VscDebugStart />
                        </span>
                        Comenzar Test
                    </button>
                    
                </div>

                {questionsToShow && (
                    <div className={styles.questionsPreviewSection}>
                        <h3 className={styles.questionsPreviewTitle}>
                            Preguntas del test ({questionsToShow.length})
                        </h3>
                        <div className={styles.questionsPreviewContainer}>
                            {questionsToShow.map((question, index) => (
                                <div key={question.id} className={styles.questionPreview}>
                                    <div className={styles.questionPreviewHeader}>
                                        <span className={styles.questionPreviewNumber}>
                                            Pregunta {index + 1}
                                        </span>
                                    </div>
                                    <p className={styles.questionPreviewText}>
                                        {question.question}
                                    </p>
                                    <div className={styles.optionsPreview}>
                                        {question.options.map((option, optIndex) => (
                                            <div 
                                                key={optIndex}
                                                className={styles.optionPreview}
                                            >
                                                <span className={styles.optionPreviewLetter}>
                                                    {String.fromCharCode(65 + optIndex)}
                                                </span>
                                                <span>{option}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles.actions}>
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