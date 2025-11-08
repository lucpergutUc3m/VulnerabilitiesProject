import { useState, useEffect, useCallback } from 'react';
import { testService, type Test } from '../services/testService';

export const useTests = (viewMode: 'mine' | 'public' = 'mine') => {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadTests = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setTests([]);
            setLoading(false);
            setError(null);
            return;
        }

        try {
            setLoading(true);
            const testsData = viewMode === 'mine' 
                ? await testService.getMyTests() 
                : await testService.getPublicTests();
            setTests(testsData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading tests');
            setTests([]);
        } finally {
            setLoading(false);
        }
    }, [viewMode]);

    useEffect(() => {
        loadTests();
    }, [loadTests]);

    const refetch = useCallback(async () => {
        await loadTests();
    }, [loadTests]);

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

        let cancelled = false;

        const loadTest = async () => {
            try {
                setLoading(true);
                const testData = await testService.getTestById(Number(testId));
                if (!cancelled) {
                    setTest(testData || null);
                    setError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Error al cargar el test');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadTest();

        return () => {
            cancelled = true;
        };
    }, [testId]);

    return { test, loading, error };
};
