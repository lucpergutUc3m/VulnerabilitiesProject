import { config } from '@env';
import { rateLimiter, RATE_LIMITS } from '../utils/rateLimiter';

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

export interface TestUpdatePrivacy {
    isPublic: boolean;
}


class TestService {
    private testsData: Test[] | null = null;
    private isLoading = false;

    async loadTests(): Promise<Test[]> {
        if (this.testsData) {
            return this.testsData;
        }

        if (this.isLoading) {
            while (this.isLoading) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return (this.testsData as Test[] | null) ?? [];
        }

        this.isLoading = true;
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found. Please login first.');
            }

            const response = await fetch(`${config.api.baseUrl}/tests`, {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.testsData = await response.json() as Test[];
            return this.testsData;
        } finally {
            this.isLoading = false;
        }
    }

    async getTestById(testId: number): Promise<Test | undefined> {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found. Please login first.');
        }
        const test = await fetch(`${config.api.baseUrl}/tests/${testId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!test.ok) {
            throw new Error(`HTTP error! status: ${test.status}`);
        }
        return test.json() as Promise<Test>;
    }

    async getAllTests(): Promise<Test[]> {
        return this.loadTests();
    }

    async getTestsByTopic(topic: string): Promise<Test[]> {
        const tests = await this.loadTests();
        return tests.filter(test => (test.topic || '').toLowerCase() === topic.toLowerCase());
    }

    async getQuestionByTestAndId(testId: number, questionId: number): Promise<Question | undefined> {
        const test = await this.getTestById(testId);
        return test?.questions.find(q => q.id === questionId);
    }

    clearCache(): void {
        this.testsData = null;
    }

    async createTest(testData: Omit<Test, 'id'>): Promise<Test> {
        if (!rateLimiter.canProceed('createTest', RATE_LIMITS.CREATE_TEST)) {
            throw new Error('Too many test creation attempts. Please wait a moment and try again.');
        }

        const apiBaseUrl = config.api.baseUrl;

        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found. Please login first.');
        }

        const questionsJson = typeof testData.questions === 'string' 
            ? testData.questions 
            : JSON.stringify(testData.questions);

        const payload = {
            title: testData.title,
            topic: testData.topic,
            category: testData.topic, 
            emoji: testData.emoji,
            description: testData.description,
            questionsJson: questionsJson,
            timeLimitMinutes: testData.timeLimit || 30
        };

        const response = await fetch(`${apiBaseUrl}/tests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const createdTest = await response.json();
        
        this.clearCache();
        
        return createdTest;
    }

    async updateTestPrivacy(testId: number, privacyData: TestUpdatePrivacy): Promise<Test> {
        const response = await fetch(`${config.api.baseUrl}/tests/${testId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(privacyData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json() as Promise<Test>;
    }

    async deleteTest(testId: number): Promise<void> {
        if (!rateLimiter.canProceed('deleteTest', RATE_LIMITS.DELETE_TEST)) {
            throw new Error('Too many delete attempts. Please wait a moment and try again.');
        }

        const response = await fetch(`${config.api.baseUrl}/tests/${testId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }

}


export const testService = new TestService();
