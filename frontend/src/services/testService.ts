/**
 * Servicio centralizado para cargar y gestionar los tests
 * Punto de entrada único: public/tests.json
 */

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
    topic: string;
    emoji: string;
    description: string;
    questions: Question[];
    timeLimit?: number;
    createdBy: string;
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
        return tests.filter(test => test.topic.toLowerCase() === topic.toLowerCase());
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
}

// Exportar instancia singleton
export const testService = new TestService();
