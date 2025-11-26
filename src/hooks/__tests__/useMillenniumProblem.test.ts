import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMillenniumProblem } from '@/hooks/useMillenniumProblem';
import * as supabaseClient from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        from: vi.fn(),
    },
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

describe('useMillenniumProblem', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches problem data successfully', async () => {
        const mockProblem = {
            id: 1,
            slug: 'pvsnp',
            title: 'P vs NP',
            field: 'Computer Science',
            status: 'unsolved',
        };

        vi.mocked(supabaseClient.supabase.from).mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: mockProblem,
                        error: null,
                    }),
                }),
            }),
        } as any);

        const { result } = renderHook(() => useMillenniumProblem('pvsnp'), {
            wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockProblem);
        expect(supabaseClient.supabase.from).toHaveBeenCalledWith('millennium_problems');
    });

    it('handles error when fetching problem', async () => {
        const mockError = { message: 'Database error' };

        vi.mocked(supabaseClient.supabase.from).mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: null,
                        error: mockError,
                    }),
                }),
            }),
        } as any);

        const { result } = renderHook(() => useMillenniumProblem('invalid-slug'), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.data).toBeUndefined();
    });

    it('caches query results', async () => {
        const mockProblem = {
            id: 1,
            slug: 'pvsnp',
            title: 'P vs NP',
        };

        vi.mocked(supabaseClient.supabase.from).mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: mockProblem,
                        error: null,
                    }),
                }),
            }),
        } as any);

        const wrapper = createWrapper();

        // First render
        const { result: result1 } = renderHook(() => useMillenniumProblem('pvsnp'), { wrapper });
        await waitFor(() => expect(result1.current.isSuccess).toBe(true));

        // Second render should use cache
        const { result: result2 } = renderHook(() => useMillenniumProblem('pvsnp'), { wrapper });

        // Should be immediately available from cache
        expect(result2.current.data).toEqual(mockProblem);
    });
});
