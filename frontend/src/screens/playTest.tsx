import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from '../css/playTest.module.css';
import { VscDebugStart } from "react-icons/vsc";
import { IoMdArrowBack } from "react-icons/io";
import { FaFileAlt, FaStar, FaRegStar } from "react-icons/fa";
import { useTestById } from '../hooks/useTests';
import { testService } from '../services/testService';
import type { Question } from '../services/testService';

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

    const [hoveredRating, setHoveredRating] = useState<number>(0);
    const [ratingMessage, setRatingMessage] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [localRatingData, setLocalRatingData] = useState<{ 
        userRating?: number | null;
        average?: number; 
        count?: number 
    }>({});

    // Use local rating data if available, otherwise use test data
    const userRating = localRatingData.userRating !== undefined ? localRatingData.userRating : test?.userRating;
    const averageRating = localRatingData.average ?? test?.averageRating;
    const ratingCount = localRatingData.count ?? test?.ratingCount;

    const handleStartTest = () => {
        navigate(`/test/${testId}/questions`);
    };

    const handleGoBack = () => {
        navigate("/");
    };

    const handleRatingClick = async (rating: number) => {
        if (!testId || isSubmitting) return;

        setIsSubmitting(true);

        try {
            const updatedTest = await testService.rateTest(parseInt(testId), rating);
            setLocalRatingData({ 
                userRating: updatedTest.userRating,
                average: updatedTest.averageRating, 
                count: updatedTest.ratingCount 
            });
            setRatingMessage('Rating submitted successfully!');
            
            setTimeout(() => {
                setRatingMessage('');
            }, 3000);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error submitting rating';
            setRatingMessage(errorMessage);
            setTimeout(() => {
                setRatingMessage('');
            }, 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClearRating = async () => {
        if (!testId || isSubmitting) return;

        setIsSubmitting(true);

        try {
            const updatedTest = await testService.deleteRating(parseInt(testId));
            setLocalRatingData({ 
                userRating: null,
                average: updatedTest.averageRating, 
                count: updatedTest.ratingCount 
            });
            setRatingMessage('Rating cleared successfully!');
            
            setTimeout(() => {
                setRatingMessage('');
            }, 3000);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error clearing rating';
            setRatingMessage(errorMessage);
            setTimeout(() => {
                setRatingMessage('');
            }, 3000);
        } finally {
            setIsSubmitting(false);
        }
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

                        {/* Rating Section */}
                        <div className={styles.ratingSection}>
                            <div className={styles.ratingRow}>
                                <span className={styles.ratingLabel}>Rate this test:</span>
                                <div className={styles.starsContainer}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            className={styles.starButton}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            onClick={() => handleRatingClick(star)}
                                            disabled={isSubmitting}
                                        >
                                            {(hoveredRating >= star || (userRating && userRating >= star)) ? (
                                                <FaStar className={styles.starFilled} />
                                            ) : (
                                                <FaRegStar className={styles.starEmpty} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {userRating != undefined && (
                                    <button
                                        className={styles.clearRatingButton}
                                        onClick={handleClearRating}
                                        disabled={isSubmitting}
                                    >
                                        Clear Rating
                                    </button>
                                )}
                            </div>
                            {(averageRating !== undefined && ratingCount !== undefined) && (
                                <div className={styles.ratingInfo}>
                                    <span className={styles.ratingStats}>
                                        Average: {averageRating.toFixed(1)} ⭐ ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
                                    </span>
                                </div>
                            )}
                            {ratingMessage && (
                                <span className={styles.ratingMessage}>{ratingMessage}</span>
                            )}
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
                                    <p className={styles.questionPreviewText} dangerouslySetInnerHTML={{ __html: question.question }} />
                                    <div className={styles.optionsPreview}>
                                        {question.options.map((option, optIndex) => (
                                            <div 
                                                key={optIndex}
                                                className={styles.optionPreview}
                                            >
                                                <span className={styles.optionPreviewLetter}>
                                                    {String.fromCharCode(65 + optIndex)}
                                                </span>
                                                <span className={styles.optionPreviewText} dangerouslySetInnerHTML={{ __html: option }} />
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