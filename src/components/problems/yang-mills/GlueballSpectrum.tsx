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
    { state: 'f0(1500)', mass: 1505, error: 15, type: 'Scalar', source: 'Predicted' },
    { state: 'Scalar 0++', mass: 1710, error: 20, type: 'Scalar', source: 'Lattice' },
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
        const margin = { top: 60, right: 120, bottom: 60, left: 70 };

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

        // Background Mixing Zones (Scalar is "hidden" by qq mixing)
        svg.append('rect')
            .attr('x', x('Scalar')!)
            .attr('y', y(1800))
            .attr('width', x.bandwidth())
            .attr('height', y(1000) - y(1800))
            .attr('fill', 'url(#mixingGradient)')
            .attr('opacity', 0.2);

        const defs = svg.append('defs');
        const grad = defs.append('linearGradient')
            .attr('id', 'mixingGradient')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '0%').attr('y2', '100%');
        grad.append('stop').attr('offset', '0%').attr('stop-color', '#ef4444').attr('stop-opacity', 0);
        grad.append('stop').attr('offset', '50%').attr('stop-color', '#ef4444').attr('stop-opacity', 1);
        grad.append('stop').attr('offset', '100%').attr('stop-color', '#ef4444').attr('stop-opacity', 0);

        // Labels for mixing
        svg.append('text')
            .attr('x', x('Scalar')! + x.bandwidth() / 2)
            .attr('y', y(1400))
            .attr('text-anchor', 'middle')
            .attr('fill', '#ef4444')
            .attr('font-size', '8px')
            .attr('font-family', 'ui-monospace')
            .attr('opacity', 0.8)
            .text('MESON_MIXING_BLIND_SPOT');

        // Grid lines
        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(D3.axisLeft(y).tickSize(-(width - margin.left - margin.right)).tickFormat(() => ''))
            .attr('stroke', '#1e293b')
            .attr('stroke-dasharray', '2,2');

        // Axes
        const xAxis = svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(D3.axisBottom(x));
        xAxis.selectAll('text').attr('fill', '#64748b').attr('font-family', 'ui-monospace');
        xAxis.selectAll('line, path').attr('stroke', '#334155');

        const yAxis = svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(D3.axisLeft(y).ticks(5).tickFormat(d => `${d} MeV`));
        yAxis.selectAll('text').attr('fill', '#64748b').attr('font-family', 'ui-monospace');
        yAxis.selectAll('line, path').attr('stroke', '#334155');

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
            .attr('stroke', d => d.source === 'BESIII' ? '#22d3ee' : (d.type === 'Scalar' ? '#ef4444' : '#6366f1'))
            .attr('stroke-width', 2);

        // Data point
        groups.append('circle')
            .attr('r', d => d.source === 'BESIII' ? 6 : 4)
            .attr('fill', d => d.source === 'BESIII' ? '#22d3ee' : (d.type === 'Scalar' ? '#7f1d1d' : '#6366f1'))
            .attr('stroke', d => d.source === 'BESIII' ? '#ffffff' : 'none')
            .attr('stroke-width', 1);

        // Labels
        groups.append('text')
            .attr('x', 14)
            .attr('y', 4)
            .text(d => d.state)
            .attr('fill', d => d.source === 'BESIII' ? '#e2e8f0' : '#475569')
            .attr('font-size', '10px')
            .attr('font-weight', d => d.source === 'BESIII' ? 'bold' : 'normal')
            .attr('font-family', 'ui-monospace');

        // Highlights for BESIII
        svg.append('text')
            .attr('x', x('Pseudoscalar')! + x.bandwidth() / 2)
            .attr('y', y(2395) - 25)
            .attr('text-anchor', 'middle')
            .attr('fill', '#22d3ee')
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .text('EXPERIMENT_CONFIRMED');

        // Title
        svg.append('text')
            .attr('x', margin.left)
            .attr('y', 30)
            .text('ESPECTRO DE GLUEBALLS: AUDITORÍA DE CANALES 2026')
            .attr('fill', 'white')
            .attr('font-size', '14px')
            .attr('font-weight', 'black')
            .attr('letter-spacing', '2px');

    }, []);

    return <svg ref={svgRef} className="max-w-full h-auto" />;
};
