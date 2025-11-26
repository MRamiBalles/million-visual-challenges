import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReferenceCard, ReferenceList } from '@/components/problem/ReferenceCard';

const mockReference = {
    title: 'Test Paper',
    authors: ['Author One', 'Author Two'],
    year: 2020,
    url: 'https://example.com/paper',
    description: 'Test description',
};

describe('ReferenceCard', () => {
    it('renders reference title and authors', () => {
        render(<ReferenceCard reference={mockReference} />);

        expect(screen.getByText('Test Paper')).toBeInTheDocument();
        expect(screen.getByText(/Author One/)).toBeInTheDocument();
        expect(screen.getByText(/Author Two/)).toBeInTheDocument();
    });

    it('displays year correctly', () => {
        render(<ReferenceCard reference={mockReference} />);
        expect(screen.getByText(/2020/)).toBeInTheDocument();
    });

    it('shows description when provided', () => {
        render(<ReferenceCard reference={mockReference} />);
        expect(screen.getByText('Test description')).toBeInTheDocument();
    });
});

describe('ReferenceList', () => {
    const mockReferences = [mockReference, { ...mockReference, title: 'Second Paper' }];

    it('renders list title', () => {
        render(<ReferenceList title="Test References" references={mockReferences} />);
        expect(screen.getByText('Test References')).toBeInTheDocument();
    });

    it('renders all references', () => {
        render(<ReferenceList title="Test References" references={mockReferences} />);
        expect(screen.getByText('Test Paper')).toBeInTheDocument();
        expect(screen.getByText('Second Paper')).toBeInTheDocument();
    });
});
