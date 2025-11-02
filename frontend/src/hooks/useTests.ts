/**
 * Hook personalizado para usar tests en componentes React
 * Utiliza el servicio centralizado que lee desde tests.json
 */

import { useState, useEffect, useCallback } from 'react';
import { testService, type Test } from '../services/testService';

export const useTests = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadTests = async () => {
        // Check if user is authenticated before loading
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
            console.log('Loaded tests:', testsData);
            setTests(testsData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar los tests');
            console.error('Error in useTests:', err);
            setTests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTests();
    }, []);

    // Función para refrescar manualmente la lista (usando useCallback para evitar recrear la función)
    const refetch = useCallback(async () => {
        testService.clearCache(); // Limpiar caché antes de recargar
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
                console.error('Error in useTestById:', err);
            } finally {
                setLoading(false);
            }
        };

        loadTest();
    }, [testId]);

    return { test, loading, error };
};
