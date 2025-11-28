import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProblemHeader } from '@/components/problem/ProblemHeader';
import type { MillenniumProblem } from '@/data/millennium-problems';

const mockProblem: MillenniumProblem = {
    id: 1,
    slug: 'test-problem',
    title: 'Test Problem',
    shortTitle: 'Test',
    field: 'Mathematics',
    year: 2000,
    status: 'unsolved',
    solver: undefined,
    solverYear: undefined,
    prize: '$1,000,000',
    clayPaper: {
        author: 'Test Author',
        year: 2000,
        url: 'https://example.com',
    },
    description: {
        simple: 'Simple description',
        intermediate: 'Intermediate description',
        advanced: 'Advanced description',
    },
    keyReferences: [],
    visualizations: [],
    applications: [],
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

        expect(screen.getByText('SIN RESOLVER')).toBeInTheDocument();
    });
});
