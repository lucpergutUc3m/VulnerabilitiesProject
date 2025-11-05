import { useState, useEffect, useCallback } from 'react';
import { testService, type Test } from '../services/testService';

export const useTests = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadTests = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setTests([]);
            setLoading(false);
            setError(null);
            return;
        }

        try {
            setLoading(true);
            const testsData = await testService.getAllTests();
            setTests(testsData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar los tests');
            setTests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTests();
    }, []);

    const refetch = useCallback(async () => {
        testService.clearCache();
        await loadTests();
    }, []);

    return { tests, loading, error, refetch };
};

export const useTestById = (testId: number | string | undefined) => {
    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!testId) {
            setLoading(false);
            return;
        }

        const loadTest = async () => {
            try {
                setLoading(true);
                const testData = await testService.getTestById(Number(testId));
                setTest(testData || null);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar el test');
            } finally {
                setLoading(false);
            }
        };

        loadTest();
    }, [testId]);

    return { test, loading, error };
};
