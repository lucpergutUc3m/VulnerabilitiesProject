import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import styles from '../css/tests.card.module.css';
import adminStyles from '../css/testCardAdmin.module.css';
import { FaEye, FaPlay, FaTrash } from 'react-icons/fa';
import type { Test } from '../services/testService';
import authService from '../services/authService';

interface TestCardProps {
    test: Test;
    onEmojiChange?: (testId: number, newEmoji: string) => void;
    defaultEmoji?: string;
    openPickerId?: number | null;
    onOpenPickerChange?: (id: number | null) => void;
    onTestDeleted?: () => void;
}

interface TestCardListProps {
    tests: Test[];
    onEmojiChange?: (testId: number, newEmoji: string) => void;
    onTestDeleted?: () => void;
}

const TestCardAdmin = ({
    test,
    onEmojiChange,
    defaultEmoji = '📚',
    openPickerId,
    onOpenPickerChange,
    onTestDeleted
}: TestCardProps) => {
    const navigate = useNavigate();
    const [selectedEmoji, setSelectedEmoji] = useState(test.emoji || defaultEmoji);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const selectorRef = useRef<HTMLDivElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    const commonEmojis = ['📚', '🧠', '📝', '🔍', '🎯', '⭐', '💡', '📊', '🎓', '⚡'];
    const isOpen = openPickerId === test.id;

    const handleEmojiSelect = (emoji: string) => {
        setSelectedEmoji(emoji);
        onOpenPickerChange?.(null);

        if (onEmojiChange) {
            onEmojiChange(test.id, emoji);
        }
    };

    const togglePicker = () => {
        onOpenPickerChange?.(isOpen ? null : test.id);
    };

    const handleViewTest = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/test/${test.id}`, { 
            state: { showQuestions: true, questions: test.questions } 
        });
    };

    const handlePlayTest = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/test/${test.id}/questions`);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const token = authService.getToken();
            
            if (!token) {
                setShowDeleteModal(false);
                return;
            }

            // Use admin route if user is admin, otherwise use regular user route
            const isAdmin = authService.isAdminUI();
            const endpoint = isAdmin 
                ? `http://localhost:8080/api/admin/tests/${test.id}`
                : `http://localhost:8080/api/tests/${test.id}`;

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                await response.json().catch(() => ({})); 
                setShowDeleteModal(false);
                return;
            }

            setShowDeleteModal(false);
            
            if (onTestDeleted) {
                onTestDeleted();
            }
        } catch {
            setShowDeleteModal(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
    };

    const getPickerStyle = () => {
        if (!isOpen || !selectorRef.current) {
            return {};
        }

        const rect = selectorRef.current.getBoundingClientRect();
        const horizontalOffset = 63;

        return {
            top: `${rect.bottom + window.scrollY + 8}px`,
            left: `${rect.left + rect.width / 2 + window.scrollX + horizontalOffset}px`,
            transform: 'translateX(-50%)'
        };
    };

    return (
        <>
            <div className={`${styles['test-card']} ${styles['test-card-admin']}`}>
                {/* Columna izquierda - Emoji */}
                <div className={styles['test-card-header']}>
                    <div className={styles['emoji-selector-container']}>
                        <div
                            ref={selectorRef}
                            className={styles['emoji-selector']}
                            onClick={togglePicker}
                        >
                            <span className={styles['emoji-display']}>{selectedEmoji}</span>
                        </div>
                    </div>
                </div>

                {/* Columna derecha - Contenido */}
                <div className={styles['test-content-area']}>
                    <div className={styles['test-main-content']}>
                        <div className={styles['test-title-topic']} >
                            <h3 className={styles['test-title']}>{test.title}</h3>
                            <span className={styles['test-topic-wrapper']} data-topic={test.topic}>
                                <span className={styles['test-topic']}>{test.topic}</span>
                            </span>
                        </div>
                        <div className={styles['test-description']}>
                            {test.description}
                        </div>
                    </div>

                    <div className={styles['test-meta']}>
                        <div className={styles['meta-left']}>
                            <span className={styles['questions-count']}>
                                {test.questions.length} preguntas
                            </span>
                        </div>
                        <button className={styles['view-button']} onClick={handleViewTest}>
                            <FaEye className={styles['button-icon']} />
                            Watch
                        </button>

                        <button className={styles['play-button']} onClick={handlePlayTest}>
                            <FaPlay className={styles['button-icon']} />
                            Play
                        </button>
                        <button className={adminStyles['delete-button']} onClick={handleDeleteClick}>
                            <FaTrash className={styles['button-icon']} />
                            Delete
                        </button>
                    </div>
                </div>
            </div>


            {isOpen &&
                createPortal(
                    <div
                        ref={pickerRef}
                        className={styles['emoji-picker-fixed']}
                        style={getPickerStyle()}
                    >
                        {commonEmojis.map((emoji, index) => (
                            <span
                                key={index}
                                className={styles['emoji-option']}
                                onClick={() => handleEmojiSelect(emoji)}
                            >
                                {emoji}
                            </span>
                        ))}
                    </div>,
                    document.body
                )}

            {showDeleteModal &&
                createPortal(
                    <div className={adminStyles['modal-overlay']}>
                        <div className={adminStyles['modal-content']}>
                            <h2 className={adminStyles['modal-title']}>Delete Test</h2>
                            <p className={adminStyles['modal-message']}>
                                Are you sure you want to delete the test "{test.title}"? This action cannot be undone.
                            </p>
                            <div className={adminStyles['modal-buttons']}>
                                <button 
                                    className={`${adminStyles['modal-button']} ${adminStyles['modal-button-cancel']}`}
                                    onClick={handleCancelDelete}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className={`${adminStyles['modal-button']} ${adminStyles['modal-button-delete']}`}
                                    onClick={handleConfirmDelete}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
};

const TestCardListAdmin = ({ tests, onEmojiChange, onTestDeleted }: TestCardListProps) => {
    const [openPickerId, setOpenPickerId] = useState<number | null>(null);

    return (
        <div className={styles['test-cards-container']}>
            {tests.map((test: Test) => (
                <TestCardAdmin
                    key={test.id}
                    test={test}
                    onEmojiChange={onEmojiChange}
                    openPickerId={openPickerId}
                    onOpenPickerChange={setOpenPickerId}
                    onTestDeleted={onTestDeleted}
                />
            ))}
        </div>
    );
};

// Exportaciones
export { TestCardAdmin, TestCardListAdmin };
export default TestCardListAdmin;