import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VisualizationContainer } from '@/components/problem/VisualizationContainer';

describe('VisualizationContainer', () => {
    it('renders title and description', () => {
        render(
            <VisualizationContainer
                title="Test Visualization"
                description="Test description"
            >
                <div>Visualization content</div>
            </VisualizationContainer>
        );

        expect(screen.getByText('Test Visualization')).toBeInTheDocument();
        expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('renders children content', () => {
        render(
            <VisualizationContainer title="Test" description="Test">
                <div data-testid="viz-content">Visualization content</div>
            </VisualizationContainer>
        );

        expect(screen.getByTestId('viz-content')).toBeInTheDocument();
    });

    it('shows fullscreen button when enabled', () => {
        render(
            <VisualizationContainer
                title="Test"
                description="Test"
                fullscreenEnabled
            >
                <div>Content</div>
            </VisualizationContainer>
        );

        expect(screen.getByLabelText(/pantalla completa/i)).toBeInTheDocument();
    });
});
