import React, { useState, useRef } from 'react';
import type { Test, Question } from '../services/testService';
import styles from '../css/createTestModal.module.css';

interface CreateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (test: Omit<Test, 'id'>) => Promise<void>;
}

const CreateTestModal: React.FC<CreateTestModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Test metadata
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [emoji, setEmoji] = useState('📝');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(30);
  const [createdBy, setCreatedBy] = useState('');

  // Questions from file
  const [questions, setQuestions] = useState<Omit<Question, 'id'>[]>([]);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.endsWith('.json')) {
      setError('Por favor, selecciona un archivo JSON válido');
      setFileName('');
      setQuestions([]);
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const jsonData = JSON.parse(content);
        
        // Validate the structure
        if (!Array.isArray(jsonData)) {
          throw new Error('El archivo debe contener un array de preguntas');
        }

        // Validate each question
        const validatedQuestions: Omit<Question, 'id'>[] = jsonData.map((q, idx) => {
          if (!q.question || typeof q.question !== 'string') {
            throw new Error(`Pregunta ${idx + 1}: falta el campo 'question'`);
          }
          if (!Array.isArray(q.options) || q.options.length < 2) {
            throw new Error(`Pregunta ${idx + 1}: 'options' debe ser un array con al menos 2 opciones`);
          }
          if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
            throw new Error(`Pregunta ${idx + 1}: 'correctAnswer' debe ser un índice válido de las opciones`);
          }
          
          return {
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || '',
          };
        });

        setQuestions(validatedQuestions);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al leer el archivo JSON');
        setQuestions([]);
        setFileName('');
      }
    };

    reader.onerror = () => {
      setError('Error al leer el archivo');
      setQuestions([]);
      setFileName('');
    };

    reader.readAsText(file);
  };

  const handleRemoveFile = () => {
    setQuestions([]);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError('El título es obligatorio');
      return false;
    }
    if (!topic.trim()) {
      setError('El tema es obligatorio');
      return false;
    }
    if (questions.length === 0) {
      setError('Debes subir un archivo con las preguntas');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const newTest: Omit<Test, 'id'> = {
        title,
        topic,
        emoji,
        description,
        timeLimit,
        createdBy,
        questions: questions.map((q, idx) => ({
          id: idx + 1,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        })),
      };

      await onSubmit(newTest);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el test');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form
      setTitle('');
      setTopic('');
      setEmoji('📝');
      setDescription('');
      setTimeLimit(30);
      setCreatedBy('');
      setQuestions([]);
      setFileName('');
      setError('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Crear Nuevo Test</h2>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          {/* Test Metadata Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Información del Test</h3>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.label}>
                  Título *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className={styles.input}
                  placeholder="Ej: Fundamentos de JavaScript"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="topic" className={styles.label}>
                  Tema *
                </label>
                <input
                  type="text"
                  id="topic"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className={styles.input}
                  placeholder="Ej: Programación"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label htmlFor="emoji" className={styles.label}>
                  Emoji
                </label>
                <input
                  type="text"
                  id="emoji"
                  value={emoji}
                  onChange={e => setEmoji(e.target.value)}
                  className={styles.input}
                  placeholder="📝"
                  maxLength={2}
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="timeLimit" className={styles.label}>
                  Tiempo límite (min)
                </label>
                <input
                  type="number"
                  id="timeLimit"
                  value={timeLimit}
                  onChange={e => setTimeLimit(parseInt(e.target.value))}
                  className={styles.input}
                  min={1}
                  max={180}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                Descripción
              </label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className={styles.textarea}
                placeholder="Describe brevemente el contenido del test..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Questions File Upload Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Preguntas *</h3>
            
            <div className={styles.uploadSection}>
              <div className={styles.uploadArea}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                  id="questionsFile"
                  disabled={isSubmitting}
                />
                <label htmlFor="questionsFile" className={styles.fileLabel}>
                  <span className={styles.uploadIcon}>📄</span>
                  <span className={styles.uploadText}>
                    {fileName ? fileName : 'Seleccionar archivo JSON con preguntas'}
                  </span>
                </label>
                {fileName && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className={styles.removeFileButton}
                    disabled={isSubmitting}
                    aria-label="Eliminar archivo"
                  >
                    ✕
                  </button>
                )}
              </div>

              {questions.length > 0 && (
                <div className={styles.fileSuccess}>
                  ✓ {questions.length} pregunta{questions.length !== 1 ? 's' : ''} cargada{questions.length !== 1 ? 's' : ''} correctamente
                </div>
              )}
            </div>

            {/* Format Instructions */}
            <div className={styles.formatInstructions}>
              <h4 className={styles.instructionsTitle}>📋 Formato esperado del archivo JSON:</h4>
              <p className={styles.instructionsText}>
                El archivo debe ser un <strong>array de objetos</strong>, donde cada objeto representa una pregunta.
                No incluyas el campo <code>id</code> - se generará automáticamente.
              </p>
              
              <div className={styles.codeBlock}>
                <pre>{`[
  {
    "question": "¿Cuál es la capital de Francia?",
    "options": [
      "Londres",
      "París",
      "Berlín",
      "Madrid"
    ],
    "correctAnswer": 1,
    "explanation": "París es la capital de Francia desde el siglo XII."
  },
  {
    "question": "¿Cuántos planetas hay en el sistema solar?",
    "options": [
      "7",
      "8",
      "9",
      "10"
    ],
    "correctAnswer": 1,
    "explanation": "Hay 8 planetas desde que Plutón fue reclasificado como planeta enano."
  }
]`}</pre>
              </div>

              <div className={styles.fieldDescriptions}>
                <p><strong>Campos requeridos:</strong></p>
                <ul>
                  <li><code>question</code> (string): El texto de la pregunta</li>
                  <li><code>options</code> (array): Array de strings con las opciones (mínimo 2)</li>
                  <li><code>correctAnswer</code> (number): Índice de la respuesta correcta (0 = primera opción, 1 = segunda, etc.)</li>
                </ul>
                <p><strong>Campos opcionales:</strong></p>
                <ul>
                  <li><code>explanation</code> (string): Explicación de por qué es correcta la respuesta</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTestModal;
