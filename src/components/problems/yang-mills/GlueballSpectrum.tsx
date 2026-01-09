import React, { useEffect, useRef } from 'react';
import * as D3 from 'd3';

interface GlueballData {
    state: string;
    mass: number; // MeV
    error: number;
    type: 'Scalar' | 'Pseudoscalar' | 'Tensor';
    source: 'BESIII' | 'Lattice' | 'Predicted';
}

const glueballData: GlueballData[] = [
    { state: 'f0(1710)', mass: 1710, error: 20, type: 'Scalar', source: 'BESIII' },
    { state: 'Lattice 0++', mass: 1730, error: 50, type: 'Scalar', source: 'Lattice' },
    { state: 'X(2370)', mass: 2395, error: 15, type: 'Pseudoscalar', source: 'BESIII' },
    { state: 'Lattice 0-+', mass: 2410, error: 40, type: 'Pseudoscalar', source: 'Lattice' },
    { state: 'f2(2340)', mass: 2340, error: 30, type: 'Tensor', source: 'BESIII' },
];

export const GlueballSpectrum = () => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const width = 600;
        const height = 400;
        const margin = { top: 40, right: 120, bottom: 40, left: 60 };

        const svg = D3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`);

        svg.selectAll('*').remove();

        const x = D3.scaleBand()
            .domain(['Scalar', 'Pseudoscalar', 'Tensor'])
            .range([margin.left, width - margin.right])
            .padding(0.4);

        const y = D3.scaleLinear()
            .domain([1000, 3000])
            .range([height - margin.bottom, margin.top]);

        // Grid lines
        svg.append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(${margin.left},0)`)
            .call(D3.axisLeft(y).tickSize(-(width - margin.left - margin.right)).tickFormat(() => ''))
            .attr('stroke-opacity', 0.1)
            .attr('stroke-dasharray', '2,2');

        // Axes
        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(D3.axisBottom(x))
            .attr('color', '#475569');

        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(D3.axisLeft(y).ticks(5))
            .attr('color', '#475569');

        // Markers
        const groups = svg.selectAll('.glueball-group')
            .data(glueballData)
            .enter()
            .append('g')
            .attr('transform', d => `translate(${x(d.type)! + x.bandwidth() / 2}, ${y(d.mass)})`);

        // Error bars
        groups.append('line')
            .attr('y1', d => y(d.mass + d.error) - y(d.mass))
            .attr('y2', d => y(d.mass - d.error) - y(d.mass))
            .attr('stroke', d => d.source === 'BESIII' ? '#22d3ee' : '#6366f1')
            .attr('stroke-width', 2);

        // Data point
        groups.append('circle')
            .attr('r', 5)
            .attr('fill', d => d.source === 'BESIII' ? '#22d3ee' : '#6366f1')
            .attr('filter', 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.5))');

        // Labels
        groups.append('text')
            .attr('x', 12)
            .attr('y', 4)
            .text(d => d.state)
            .attr('fill', '#94a3b8')
            .attr('font-size', '10px')
            .attr('font-family', 'ui-monospace');

        // Title
        svg.append('text')
            .attr('x', margin.left)
            .attr('y', 20)
            .text('GLUEBALL MASS SPECTRUM: BESIII VS LATTICE')
            .attr('fill', 'white')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold');

    }, []);

    return <svg ref={svgRef} className="max-w-full h-auto" />;
};
