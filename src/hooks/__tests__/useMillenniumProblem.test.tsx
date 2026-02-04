import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn()
                })),
                order: vi.fn()
            }))
        }))
    }
}));

import { useMillenniumProblem, useMillenniumProblems } from '../useMillenniumProblem';
import { supabase } from '@/integrations/supabase/client';

// Mock data matching database schema
const mockProblemData = {
    id: 1,
    slug: 'pvsnp',
    title: 'P vs NP Problem',
    short_title: 'P vs NP',
    field: 'Computer Science',
    year: 2000,
    status: 'unsolved',
    solver: null,
    solver_year: null,
    prize: '$1,000,000',
    clay_paper_author: 'Stephen Cook',
    clay_paper_year: 2000,
    clay_paper_url: 'https://claymath.org/pvsnp',
    description_simple: 'Can every problem whose solution can be quickly verified also be quickly solved?',
    description_intermediate: 'The P vs NP problem asks whether P = NP, where P is the class of decision problems solvable in polynomial time...',
    description_advanced: 'Formally, P = NP asks whether PTIME = NPTIME, where PTIME = ∪_{k≥0} DTIME(n^k)...'
};

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0
            }
        }
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

    it('fetches a single problem by slug', async () => {
        // Setup mock chain
        const singleMock = vi.fn().mockResolvedValue({
            data: mockProblemData,
            error: null
        });
        const eqMock = vi.fn().mockReturnValue({ single: singleMock });
        const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
        
        vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as any);

        const { result } = renderHook(() => useMillenniumProblem('pvsnp'), {
            wrapper: createWrapper()
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // Verify the data transformation
        expect(result.current.data).toBeDefined();
        expect(result.current.data?.slug).toBe('pvsnp');
        expect(result.current.data?.title).toBe('P vs NP Problem');
        expect(result.current.data?.shortTitle).toBe('P vs NP');
        expect(result.current.data?.status).toBe('unsolved');
        
        // Verify clayPaper nested object
        expect(result.current.data?.clayPaper).toEqual({
            author: 'Stephen Cook',
            year: 2000,
            url: 'https://claymath.org/pvsnp'
        });

        // Verify description nested object
        expect(result.current.data?.description.simple).toContain('quickly verified');
    });

    it('transforms database snake_case to camelCase correctly', async () => {
        const singleMock = vi.fn().mockResolvedValue({
            data: mockProblemData,
            error: null
        });
        const eqMock = vi.fn().mockReturnValue({ single: singleMock });
        const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
        
        vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as any);

        const { result } = renderHook(() => useMillenniumProblem('pvsnp'), {
            wrapper: createWrapper()
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // Verify snake_case → camelCase transformation
        expect(result.current.data?.shortTitle).toBeDefined(); // short_title → shortTitle
        expect(result.current.data?.solverYear).toBeUndefined(); // solver_year → solverYear (null)
    });

    it('handles database errors gracefully', async () => {
        const singleMock = vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Row not found', code: 'PGRST116' }
        });
        const eqMock = vi.fn().mockReturnValue({ single: singleMock });
        const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
        
        vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as any);

        const { result } = renderHook(() => useMillenniumProblem('nonexistent'), {
            wrapper: createWrapper()
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        
        expect(result.current.error).toBeDefined();
    });

    it('uses correct query key for caching', async () => {
        const singleMock = vi.fn().mockResolvedValue({
            data: mockProblemData,
            error: null
        });
        const eqMock = vi.fn().mockReturnValue({ single: singleMock });
        const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
        
        vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as any);

        renderHook(() => useMillenniumProblem('riemann'), {
            wrapper: createWrapper()
        });

        // Verify the from() was called with correct table
        expect(supabase.from).toHaveBeenCalledWith('millennium_problems');
    });
});

describe('useMillenniumProblems', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches all problems ordered by year', async () => {
        const mockProblems = [
            { ...mockProblemData, id: 1, year: 2000 },
            { ...mockProblemData, id: 2, slug: 'riemann', year: 2000 },
        ];

        const orderMock = vi.fn().mockResolvedValue({
            data: mockProblems,
            error: null
        });
        const selectMock = vi.fn().mockReturnValue({ order: orderMock });
        
        vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as any);

        const { result } = renderHook(() => useMillenniumProblems(), {
            wrapper: createWrapper()
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toHaveLength(2);
        expect(orderMock).toHaveBeenCalledWith('year', { ascending: true });
    });

    it('transforms all problems in the array', async () => {
        const mockProblems = [
            { ...mockProblemData, id: 1, short_title: 'P vs NP' },
            { ...mockProblemData, id: 2, short_title: 'Riemann' },
        ];

        const orderMock = vi.fn().mockResolvedValue({
            data: mockProblems,
            error: null
        });
        const selectMock = vi.fn().mockReturnValue({ order: orderMock });
        
        vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as any);

        const { result } = renderHook(() => useMillenniumProblems(), {
            wrapper: createWrapper()
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // Each problem should have camelCase properties
        result.current.data?.forEach(problem => {
            expect(problem.shortTitle).toBeDefined();
            expect(problem.clayPaper).toBeDefined();
            expect(problem.description).toBeDefined();
        });
    });
});
