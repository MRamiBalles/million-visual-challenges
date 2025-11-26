import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProblemHeader } from '@/components/problem/ProblemHeader';

const mockProblem = {
    id: 1,
    slug: 'test-problem',
    title: 'Test Problem',
    short_title: 'Test',
    field: 'Mathematics',
    year: 2000,
    status: 'unsolved' as const,
    solver: '',
    solver_year: 0,
    prize: '$1,000,000',
    description_simple: 'Simple description',
    description_intermediate: 'Intermediate description',
    description_advanced: 'Advanced description',
    clay_paper_author: 'Test Author',
    clay_paper_year: 2000,
    clay_paper_url: 'https://example.com',
    cover_image_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
};

describe('ProblemHeader', () => {
    it('renders problem title correctly', () => {
        render(
            <BrowserRouter>
                <ProblemHeader problem={mockProblem} />
            </BrowserRouter>
        );

        expect(screen.getByText('Test Problem')).toBeInTheDocument();
    });

    it('displays problem metadata', () => {
        render(
            <BrowserRouter>
                <ProblemHeader problem={mockProblem} />
            </BrowserRouter>
        );

        expect(screen.getByText('Mathematics')).toBeInTheDocument();
        expect(screen.getByText('$1,000,000')).toBeInTheDocument();
    });

    it('shows unsolved status badge', () => {
        render(
            <BrowserRouter>
                <ProblemHeader problem={mockProblem} />
            </BrowserRouter>
        );

        expect(screen.getByText('Sin Resolver')).toBeInTheDocument();
    });
});
