import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DifficultySelector } from '@/components/problem/DifficultySelector';

describe('DifficultySelector', () => {
    const mockOnLevelChange = vi.fn();

    it('renders all three difficulty levels', () => {
        render(
            <DifficultySelector
                currentLevel="simple"
                onLevelChange={mockOnLevelChange}
                simpleContent={<div>Simple content</div>}
                intermediateContent={<div>Intermediate content</div>}
                advancedContent={<div>Advanced content</div>}
            />
        );

        expect(screen.getByText('Simple')).toBeInTheDocument();
        expect(screen.getByText('Intermedio')).toBeInTheDocument();
        expect(screen.getByText('Avanzado')).toBeInTheDocument();
    });

    it('displays simple content by default', () => {
        render(
            <DifficultySelector
                currentLevel="simple"
                onLevelChange={mockOnLevelChange}
                simpleContent={<div>Simple content</div>}
                intermediateContent={<div>Intermediate content</div>}
                advancedContent={<div>Advanced content</div>}
            />
        );

        expect(screen.getByText('Simple content')).toBeInTheDocument();
    });

    it('calls onLevelChange when clicking a tab', () => {
        render(
            <DifficultySelector
                currentLevel="simple"
                onLevelChange={mockOnLevelChange}
                simpleContent={<div>Simple content</div>}
                intermediateContent={<div>Intermediate content</div>}
                advancedContent={<div>Advanced content</div>}
            />
        );

        fireEvent.click(screen.getByText('Intermedio'));
        expect(mockOnLevelChange).toHaveBeenCalledWith('intermediate');
    });
});
