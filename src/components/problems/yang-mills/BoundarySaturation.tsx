import React, { useRef, useEffect } from 'react';
import * as D3 from 'd3';

export const BoundarySaturation = () => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const width = 600;
        const height = 300;
        const margin = { top: 40, right: 60, bottom: 60, left: 60 };

        const svg = D3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`);

        svg.selectAll('*').remove();

        // Simulated Data based on Barca et al. 2024
        const delta = 4;
        const data = Array.from({ length: 10 }, (_, i) => {
            const d = i + 1;
            const xi = delta / 2;
            let reduction;
            if (d <= delta) {
                reduction = Math.exp(-d / xi);
            } else {
                reduction = Math.exp(-delta / xi) * (1 + 0.05 * (d - delta));
            }
            return { d, reduction };
        });

        const x = D3.scaleLinear()
            .domain([0, 10])
            .range([margin.left, width - margin.right]);

        const y = D3.scaleLinear()
            .domain([0, 1])
            .range([height - margin.bottom, margin.top]);

        // Gradient for boundary zone
        const defs = svg.append('defs');
        const bgGrad = defs.append('linearGradient')
            .attr('id', 'boundaryGrad')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '100%').attr('y2', '0%');
        bgGrad.append('stop').attr('offset', '0%').attr('stop-color', '#1e293b').attr('stop-opacity', 0.5);
        bgGrad.append('stop').attr('offset', `${(delta / 10) * 100}%`).attr('stop-color', '#ef4444').attr('stop-opacity', 0.1);
        bgGrad.append('stop').attr('offset', '100%').attr('stop-color', '#1e293b').attr('stop-opacity', 0.5);

        svg.append('rect')
            .attr('x', margin.left)
            .attr('y', margin.top)
            .attr('width', x(delta) - margin.left)
            .attr('height', height - margin.top - margin.bottom)
            .attr('fill', 'url(#boundaryGrad)');

        // Axes
        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(D3.axisBottom(x).ticks(10))
            .attr('color', '#475569');

        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(D3.axisLeft(y).ticks(5))
            .attr('color', '#475569');

        // Line
        const line = D3.line<any>()
            .x(d => x(d.d))
            .y(d => y(d.reduction))
            .curve(D3.curveMonotoneX);

        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', '#22d3ee')
            .attr('stroke-width', 3)
            .attr('d', line);

        // Saturation Point
        svg.append('circle')
            .attr('cx', x(delta))
            .attr('cy', y(data[delta - 1].reduction))
            .attr('r', 6)
            .attr('fill', '#ef4444')
            .attr('stroke', 'white');

        svg.append('text')
            .attr('x', x(delta) + 10)
            .attr('y', y(data[delta - 1].reduction) - 10)
            .attr('fill', '#ef4444')
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .text('PUNTO DE SATURACIÓN (Δ=4)');

        // Title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .text('SATURACIÓN DE ERROR EN FRONTERA (BARCA ET AL. 2024)');

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height - 10)
            .attr('text-anchor', 'middle')
            .attr('fill', '#64748b')
            .attr('font-size', '10px')
            .text('Distancia a frontera congelada (a)');

    }, []);

    return <svg ref={svgRef} className="max-w-full h-auto" />;
};
