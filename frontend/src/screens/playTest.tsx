import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from '../css/playTest.module.css';
import { VscDebugStart } from "react-icons/vsc";
import { IoMdArrowBack } from "react-icons/io";
import { FaFileAlt } from "react-icons/fa";
import { useTestById } from '../hooks/useTests';
import type { Question } from '../services/testService';
import SafeText from '../components/SafeText';

interface LocationState {
    showQuestions?: boolean;
    questions?: Question[];
}

const TestStartPage = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { test, loading, error } = useTestById(testId);
    
    const state = location.state as LocationState;
    const showQuestions = state?.showQuestions || false;
    const stateQuestions = state?.questions || [];

    const handleStartTest = () => {
        navigate(`/test/${testId}/questions`);
    };

    const handleGoBack = () => {
        navigate("/");
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading test...</p>
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

    const questionsToShow = showQuestions && stateQuestions.length > 0 ? stateQuestions : null;

    return (
        <div className={styles.container}>
            <div className={styles.backButtonContainer}>
                <button onClick={handleGoBack} className={styles.backButton}>
                    <IoMdArrowBack />
                    Back to Home
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
                            <FaFileAlt className={styles.questionIcon} />
                            <strong>{test.questions.length}</strong>
                            <span>questions</span>
                        </div>
                    </div>
                    <div className={styles.actionButtons}>
                        <button
                            onClick={handleStartTest}
                            className={styles.startButton}
                        >
                            <span className={styles.buttonIcon}>
                                <VscDebugStart />
                            </span>
                            Start Test
                        </button>
                    </div>
                </div>

                {questionsToShow && (
                    <div className={styles.questionsPreviewSection}>
                        <h3 className={styles.questionsPreviewTitle}>
                            Test Questions ({questionsToShow.length})
                        </h3>
                        <div className={styles.questionsPreviewContainer}>
                            {questionsToShow.map((question, index) => (
                                <div key={question.id} className={styles.questionPreview}>
                                    <div className={styles.questionPreviewHeader}>
                                        <span className={styles.questionPreviewNumber}>
                                            Question {index + 1}
                                        </span>
                                    </div>
                                    <p className={styles.questionPreviewText}>
                                        <SafeText text={question.question} />
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
                                                <span className={styles.optionPreviewText}>
                                                    <SafeText text={option} />
                                                </span>
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
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestStartPage;