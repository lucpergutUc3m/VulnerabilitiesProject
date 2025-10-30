import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from '../css/tests.card.module.css';

interface Test {
    id: number;
    title: string;
    topic: string;
    description: string;
    questionsCount: number;
    createdAt: string;
    emoji: string;
}

interface TestCardProps {
    test: Test;
    onEmojiChange?: (testId: number, newEmoji: string) => void;
    defaultEmoji?: string;
    openPickerId?: number | null;
    onOpenPickerChange?: (id: number | null) => void;
}

interface TestCardListProps {
    tests: Test[];
    onEmojiChange?: (testId: number, newEmoji: string) => void;
}

const TestCard = ({
    test,
    onEmojiChange,
    defaultEmoji = '📚',
    openPickerId,
    onOpenPickerChange
}: TestCardProps) => {
    const [selectedEmoji, setSelectedEmoji] = useState(test.emoji || defaultEmoji);
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
            <div className={styles['test-card']}>
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
                                {test.questionsCount || 0} preguntas
                            </span>
                            <span className={styles['created-date']}>
                                {new Date(test.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <button className={styles['view-button']}>Ver</button>
                    </div>
                </div>
            </div>

            {/* Picker en posición fija, completamente fuera del flujo */}
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

const TestCardList = ({ tests, onEmojiChange }: TestCardListProps) => {
    const [openPickerId, setOpenPickerId] = useState<number | null>(null);

    return (
        <div className={styles['test-cards-container']}>
            {tests.map((test: Test) => (
                <TestCard
                    key={test.id}
                    test={test}
                    onEmojiChange={onEmojiChange}
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