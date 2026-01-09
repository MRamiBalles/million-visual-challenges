import React, { useEffect, useRef } from 'react';
import * as D3 from 'd3';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const GlueballSpectrum = () => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        // Datos basados en fuentes BESIII (2024-2025) y Lattice QCD
        const data = [
            {
                channel: "0++ (Scalar)",
                mass: 1710,
                uncertainty: 150,
                type: "Theory (Lattice)",
                status: "Mixed/Obscured",
                note: "Blind Spot Mesónico (f0 mixing)"
            },
            {
                channel: "2++ (Tensor)",
                mass: 2340,
                uncertainty: 80,
                type: "Theory (Lattice)",
                status: "Candidate",
                note: "f2(2340) candidate"
            },
            {
                channel: "0-+ (Pseudoscalar)",
                mass: 2395,
                uncertainty: 11, // Precisión BESIII
                type: "Experiment (BESIII)",
                status: "Confirmed",
                note: "X(2370) - Mass Gap Anchor"
            }
        ];

        // Configuración D3
        const width = 600;
        const height = 400;
        const margin = { top: 40, right: 120, bottom: 60, left: 80 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = D3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .html(null) // Limpiar render previos
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Escalas
        const xScale = D3.scalePoint()
            .domain(data.map(d => d.channel))
            .range([0, innerWidth])
            .padding(0.5);

        const yScale = D3.scaleLinear()
            .domain([1000, 3000]) // MeV (updated range for better visibility)
            .range([innerHeight, 0]);

        // Ejes
        svg.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(D3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#94a3b8") // Slate-400
            .style("font-family", "ui-monospace");

        svg.append("g")
            .call(D3.axisLeft(yScale).tickFormat(d => `${d} MeV`))
            .selectAll("text")
            .style("fill", "#64748b") // Slate-500
            .style("font-family", "ui-monospace");

        svg.selectAll(".domain, line").style("stroke", "#334155");

        // Zona de "Blind Spot Mesónico" (Mezcla f0)
        svg.append("rect")
            .attr("x", xScale("0++ (Scalar)")! - 40)
            .attr("y", yScale(1800))
            .attr("width", 80)
            .attr("height", yScale(1500) - yScale(1800))
            .attr("fill", "rgba(239, 68, 68, 0.1)") // Red-500/10
            .attr("stroke", "#ef4444")
            .attr("stroke-dasharray", "4");

        svg.append("text")
            .attr("x", xScale("0++ (Scalar)")!)
            .attr("y", yScale(1450))
            .attr("text-anchor", "middle")
            .attr("fill", "#ef4444")
            .style("font-size", "10px")
            .style("font-family", "ui-monospace")
            .text("Mezcla Mesónica (Ruido)");

        // Barras de Error y Puntos
        data.forEach(d => {
            const x = xScale(d.channel)!;
            const y = yScale(d.mass);
            const yMin = yScale(d.mass - d.uncertainty);
            const yMax = yScale(d.mass + d.uncertainty);

            // Línea de incertidumbre
            svg.append("line")
                .attr("x1", x)
                .attr("x2", x)
                .attr("y1", yMin)
                .attr("y2", yMax)
                .attr("stroke", d.type.includes("Experiment") ? "#22d3ee" : "#6366f1") // Cyan vs Indigo
                .attr("stroke-width", 2);

            // Topes de barra de error
            svg.append("line").attr("x1", x - 10).attr("x2", x + 10).attr("y1", yMin).attr("y2", yMin).attr("stroke", "#475569");
            svg.append("line").attr("x1", x - 10).attr("x2", x + 10).attr("y1", yMax).attr("y2", yMax).attr("stroke", "#475569");

            // Punto central (Masa)
            svg.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", d.type.includes("Experiment") ? 8 : 5)
                .attr("fill", d.type.includes("Experiment") ? "#22d3ee" : "#6366f1")
                .attr("stroke", "white")
                .attr("stroke-width", 2);

            // Etiqueta (X2370 Pulse effect)
            if (d.note.includes("X(2370)")) {
                svg.append("circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("r", 15)
                    .attr("fill", "none")
                    .attr("stroke", "#22d3ee")
                    .attr("opacity", 0.5)
                    .append("animate")
                    .attr("attributeName", "r")
                    .attr("values", "10;20;10")
                    .attr("dur", "2s")
                    .attr("repeatCount", "indefinite");

                svg.append("text")
                    .attr("x", x + 25)
                    .attr("y", y + 5)
                    .text("X(2370) BESIII")
                    .attr("fill", "#22d3ee")
                    .attr("font-weight", "bold")
                    .attr("font-size", "12px")
                    .style("font-family", "ui-monospace");
            }
        });

    }, []);

    return (
        <div className="w-full">
            {/* Render without Card wrapper to fit existing layout perfectly */}
            <svg ref={svgRef} className="max-w-full h-auto" />
        </div>
    );
};

export default GlueballSpectrum; // Export default for easier generic import usage if needed, but named export is preferred in this codebase usually.
// Adding named export as well to match previous pattern
export { GlueballSpectrum };
