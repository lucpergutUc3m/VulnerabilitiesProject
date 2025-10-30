import { useState } from 'react';
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
}

interface TestCardListProps {
    tests: Test[];
    onEmojiChange?: (testId: number, newEmoji: string) => void;
}

const TestCard = ({
    test,
    onEmojiChange,
    defaultEmoji = '📚'
}: TestCardProps) => {
    const [selectedEmoji, setSelectedEmoji] = useState(test.emoji || defaultEmoji);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const commonEmojis = ['📚', '🧠', '📝', '🔍', '🎯', '⭐', '💡', '📊', '🎓', '⚡'];

    const handleEmojiSelect = (emoji: string) => {
        setSelectedEmoji(emoji);
        setShowEmojiPicker(false);

        if (onEmojiChange) {
            onEmojiChange(test.id, emoji);
        }
    };

    return (
        <div className={styles['test-card']}>
            {/* Columna izquierda - Emoji */}
            <div className={styles['test-card-header']}>
                <div className={styles['emoji-selector-container']}>
                    <div
                        className={styles['emoji-selector']}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                        <span className={styles['emoji-display']}>{selectedEmoji}</span>
                    </div>

                    {showEmojiPicker && (
                        <div className={styles['emoji-picker']}>
                            {commonEmojis.map((emoji, index) => (
                                <span
                                    key={index}
                                    className={styles['emoji-option']}
                                    onClick={() => handleEmojiSelect(emoji)}
                                >
                                    {emoji}
                                </span>
                            ))}
                        </div>
                    )}
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
    );
};

// Componente TestCardList - Este es el que debes usar
const TestCardList = ({ tests, onEmojiChange }: TestCardListProps) => {
    return (
        <div className={styles['test-cards-container']}>
            {tests.map((test: Test) => (
                <TestCard
                    key={test.id}
                    test={test}
                    onEmojiChange={onEmojiChange}
                />
            ))}
        </div>
    );
};

// Exportaciones
export { TestCard, TestCardList };
export default TestCardList;