/**
 * Servicio centralizado para cargar y gestionar los tests
 * Punto de entrada único: public/tests.json
 */

import { config } from '@env';

export interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

export interface Test {
    id: number;
    title: string;
    topic?: string;
    category?: string;
    emoji: string;
    description: string;
    questions: Question[];
    questionsJson?: string;
    timeLimit?: number;
    timeLimitMinutes?: number;
    createdBy?: string;
    ownerId?: number;
    ownerEmail?: string;
}

export interface TestsData {
    tests: Test[];
}

class TestService {
    private testsData: TestsData | null = null;
    private isLoading = false;

    /**
     * Carga todos los tests desde el JSON centralizado
     */
    async loadTests(): Promise<Test[]> {
        if (this.testsData) {
            return this.testsData.tests;
        }

        if (this.isLoading) {
            // Esperar a que se complete la carga anterior
            while (this.isLoading) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return (this.testsData as TestsData | null)?.tests ?? [];
        }

        this.isLoading = true;
        try {
            const response = await fetch('/tests.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.testsData = await response.json() as TestsData;
            return this.testsData.tests;
        } catch (error) {
            console.error('Error loading tests:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Obtiene un test específico por su ID
     */
    async getTestById(testId: number): Promise<Test | undefined> {
        const tests = await this.loadTests();
        return tests.find(test => test.id === testId);
    }

    /**
     * Obtiene todos los tests
     */
    async getAllTests(): Promise<Test[]> {
        return this.loadTests();
    }

    /**
     * Obtiene tests filtrados por topic
     */
    async getTestsByTopic(topic: string): Promise<Test[]> {
        const tests = await this.loadTests();
        return tests.filter(test => (test.topic || '').toLowerCase() === topic.toLowerCase());
    }

    /**
     * Obtiene una pregunta específica de un test
     */
    async getQuestionByTestAndId(testId: number, questionId: number): Promise<Question | undefined> {
        const test = await this.getTestById(testId);
        return test?.questions.find(q => q.id === questionId);
    }

    /**
     * Limpia el caché de tests cargados
     */
    clearCache(): void {
        this.testsData = null;
    }

    /**
     * Crea un nuevo test enviándolo al backend
     */
    async createTest(testData: Omit<Test, 'id'>): Promise<Test> {
        try {
            // Obtener la URL base de la API desde la configuración
            const apiBaseUrl = config.api.baseUrl;

            // Obtener el token de autenticación
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found. Please login first.');
            }

            // Transformar las questions a JSON string si es necesario
            const questionsJson = typeof testData.questions === 'string' 
                ? testData.questions 
                : JSON.stringify(testData.questions);

            // Preparar el payload para el backend
            const payload = {
                title: testData.title,
                topic: testData.topic,
                category: testData.topic, // El backend usa 'category'
                emoji: testData.emoji,
                description: testData.description,
                questionsJson: questionsJson,
                timeLimitMinutes: testData.timeLimit || 30
            };

            console.log('Creating test with payload:', payload);

            const response = await fetch(`${apiBaseUrl}/tests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const createdTest = await response.json();
            
            console.log('Test created successfully:', createdTest);
            
            // Limpiar caché para forzar recarga de tests
            this.clearCache();
            
            return createdTest;
        } catch (error) {
            console.error('Error creating test:', error);
            throw error;
        }
    }
}

// Exportar instancia singleton
export const testService = new TestService();
