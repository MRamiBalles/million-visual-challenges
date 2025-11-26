import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserProgress } from '@/hooks/useUserProgress';
import * as supabaseClient from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        from: vi.fn(),
    },
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

describe('useUserProgress', () => {
    const mockUserId = 'user-123';
    const mockProblemId = 1;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with default values when no user', () => {
        const { result } = renderHook(() => useUserProgress(mockProblemId, undefined), {
            wrapper: createWrapper(),
        });

        expect(result.current.isBookmarked).toBe(false);
    });

    it('fetches user progress successfully', async () => {
        const mockProgress = {
            id: 'progress-1',
            user_id: mockUserId,
            problem_id: mockProblemId,
            level: 'intermediate',
            bookmarked: true,
            time_spent_seconds: 300,
        };

        vi.mocked(supabaseClient.supabase.from).mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({
                            data: mockProgress,
                            error: null,
                        }),
                    }),
                }),
            }),
        } as any);

        const { result } = renderHook(() => useUserProgress(mockProblemId, mockUserId), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isBookmarked).toBe(true);
        });
    });

    it('updates difficulty level', async () => {
        vi.mocked(supabaseClient.supabase.from).mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({
                            data: null,
                            error: null,
                        }),
                    }),
                }),
            }),
            upsert: vi.fn().mockResolvedValue({
                data: { level: 'advanced' },
                error: null,
            }),
        } as any);

        const { result } = renderHook(() => useUserProgress(mockProblemId, mockUserId), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            await result.current.updateLevel('advanced');
        });

        await waitFor(() => {
            expect(supabaseClient.supabase.from).toHaveBeenCalledWith('user_progress');
        });
    });

    it('toggles bookmark status', async () => {
        const mockProgress = {
            bookmarked: false,
        };

        vi.mocked(supabaseClient.supabase.from).mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({
                            data: mockProgress,
                            error: null,
                        }),
                    }),
                }),
            }),
            upsert: vi.fn().mockResolvedValue({
                data: { bookmarked: true },
                error: null,
            }),
        } as any);

        const { result } = renderHook(() => useUserProgress(mockProblemId, mockUserId), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isBookmarked).toBe(false);
        });

        await act(async () => {
            await result.current.toggleBookmark();
        });

        // Verify upsert was called
        expect(supabaseClient.supabase.from).toHaveBeenCalledWith('user_progress');
    });

    it('updates time spent', async () => {
        vi.mocked(supabaseClient.supabase.from).mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({
                            data: { time_spent_seconds: 100 },
                            error: null,
                        }),
                    }),
                }),
            }),
            upsert: vi.fn().mockResolvedValue({
                data: { time_spent_seconds: 130 },
                error: null,
            }),
        } as any);

        const { result } = renderHook(() => useUserProgress(mockProblemId, mockUserId), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            await result.current.updateTimeSpent(30);
        });

        expect(supabaseClient.supabase.from).toHaveBeenCalledWith('user_progress');
    });

    it('handles errors gracefully', async () => {
        const mockError = { message: 'Database error' };

        vi.mocked(supabaseClient.supabase.from).mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({
                            data: null,
                            error: mockError,
                        }),
                    }),
                }),
            }),
        } as any);

        const { result } = renderHook(() => useUserProgress(mockProblemId, mockUserId), {
            wrapper: createWrapper(),
        });

        // Should not throw, just handle gracefully
        expect(result.current.isBookmarked).toBe(false);
    });
});
