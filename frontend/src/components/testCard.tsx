import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import styles from '../css/tests.card.module.css';
import { FaEye, FaPlay, FaShareAlt, FaLock, FaTrash } from 'react-icons/fa';
import type { Test } from '../services/testService';
import { testService } from '../services/testService';

interface TestCardProps {
    test: Test;
    onEmojiChange?: (testId: number, newEmoji: string) => void;
    onVisibilityChange?: (testId: number, isPublic: boolean) => void;
    onDelete?: (testId: number) => void;
    showOwnerActions?: boolean;
    defaultEmoji?: string;
    openPickerId?: number | null;
    onOpenPickerChange?: (id: number | null) => void;
}

interface TestCardListProps {
    tests: Test[];
    onEmojiChange?: (testId: number, newEmoji: string) => void;
    onVisibilityChange?: (testId: number, isPublic: boolean) => void;
    onDelete?: (testId: number) => void;
    showOwnerActions?: boolean;
}

const TestCard = ({
    test,
    onEmojiChange,
    onVisibilityChange,
    onDelete,
    showOwnerActions = false,
    defaultEmoji = '📚',
    openPickerId,
    onOpenPickerChange
}: TestCardProps) => {
    const navigate = useNavigate();
    const [selectedEmoji, setSelectedEmoji] = useState(test.emoji || defaultEmoji);
    const [isPublic, setIsPublic] = useState(test.isPublic || false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
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

    const handleToggleVisibility = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (isUpdating) return;

        try {
            setIsUpdating(true);
            const newIsPublic = !isPublic;
            
            await testService.updateTestPrivacy(test.id, { isPublic: newIsPublic });
            
            setIsPublic(newIsPublic);
            
            if (onVisibilityChange) {
                onVisibilityChange(test.id, newIsPublic);
            }
        } catch (error) {
            console.error('Error updating test visibility:', error);
            alert('Failed to update test visibility. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (isDeleting) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${test.title}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setIsDeleting(true);
            await testService.deleteTest(test.id);
            
            if (onDelete) {
                onDelete(test.id);
            }
        } catch (error) {
            console.error('Error deleting test:', error);
            alert('Failed to delete test. Please try again.');
            setIsDeleting(false);
        }
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
            <div className={`${styles['test-card']} ${styles['test-card-normal']}`}>
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
                            <span className={styles['test-topic-wrapper']}>
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
                        <div className={styles['test-meta-buttons']}>
                            {showOwnerActions && (
                                <>
                                    <button 
                                        className={`${styles['share-button']} ${isPublic ? styles['shared'] : ''}`}
                                        onClick={handleToggleVisibility}
                                        disabled={isUpdating || isDeleting}
                                        title={isPublic ? 'Make private' : 'Make public'}
                                    >
                                        {isPublic ? (
                                            <FaShareAlt className={styles['button-icon']} />
                                        ) : (
                                            <FaLock className={styles['button-icon']} />
                                        )}
                                        {isPublic ? 'Public' : 'Private'}
                                    </button>
                                    <button 
                                        className={styles['delete-button']}
                                        onClick={handleDelete}
                                        disabled={isUpdating || isDeleting}
                                        title="Delete test"
                                    >
                                        <FaTrash className={styles['button-icon']} />
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                </>
                            )}
                            <button className={styles['view-button']} onClick={handleViewTest}>
                                <FaEye className={styles['button-icon']} />
                                Watch
                            </button>
                            <button className={styles['play-button']} onClick={handlePlayTest}>
                                <FaPlay className={styles['button-icon']} />
                                Play
                            </button>
                        </div>
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
        </>
    );
};

const TestCardList = ({ tests, onEmojiChange, onVisibilityChange, onDelete, showOwnerActions }: TestCardListProps) => {
    const [openPickerId, setOpenPickerId] = useState<number | null>(null);

    return (
        <div className={styles['test-cards-container']}>
            {tests.map((test: Test) => (
                <TestCard
                    key={test.id}
                    test={test}
                    onEmojiChange={onEmojiChange}
                    onVisibilityChange={onVisibilityChange}
                    onDelete={onDelete}
                    showOwnerActions={showOwnerActions}
                    openPickerId={openPickerId}
                    onOpenPickerChange={setOpenPickerId}
                />
            ))}
        </div>
    );
};

// Exportaciones
export { TestCard, TestCardList };
export default TestCardList;