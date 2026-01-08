import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";
import { PieChart, TrendingDown, Target } from "lucide-react";

/**
 * RankDistributionPie: Visualización de la distribución de rangos (Conjetura de Goldfeld / Alexander Smith 2025).
 * Muestra la distribución 50% Rango 0, 50% Rango 1, y la rareza del Rango >= 2.
 */

export const RankDistributionPie = () => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        if (!svg.node()) return;

        const width = 300;
        const height = 300;
        const radius = Math.min(width, height) / 2 - 20;

        svg.selectAll("*").remove();

        const data = [
            { label: "Rango 0", value: 50, color: "#f59e0b" },
            { label: "Rango 1", value: 49.9, color: "#22c55e" },
            { label: "Rango ≥ 2", value: 0.1, color: "#a855f7" }
        ];

        const pie = d3.pie<any>().value(d => d.value);
        const arc = d3.arc<any>().innerRadius(60).outerRadius(radius);
        const labelArc = d3.arc<any>().innerRadius(radius + 10).outerRadius(radius + 10);

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const arcs = g.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc");

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => d.data.color)
            .attr("stroke", "rgba(0,0,0,0.5)")
            .attr("stroke-width", 2)
            .style("opacity", 0.8)
            .on("mouseover", function () {
                d3.select(this).style("opacity", 1);
            })
            .on("mouseout", function () {
                d3.select(this).style("opacity", 0.8);
            });

        // Líneas y etiquetas
        arcs.append("text")
            .attr("transform", d => `translate(${labelArc.centroid(d)})`)
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("fill", "rgba(255,255,255,0.6)")
            .attr("font-size", "10px")
            .attr("font-family", "monospace")
            .text(d => `${d.data.label}: ${d.data.value}%`);

    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden"
        >
            <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-green-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Distribución de Goldfeld (2025)</h3>
            </div>

            <div className="flex flex-col items-center">
                <svg ref={svgRef} width={300} height={300} className="w-full h-auto max-w-[250px]" />

                <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                    <div className="flex items-start gap-3">
                        <Target className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                        <p className="text-[10px] text-white/50 leading-relaxed">
                            <span className="text-white font-bold block mb-1">Vindicación de Smith</span>
                            Alexander Smith probó que para el 100% de los giros cuadráticos, la distribución de Selmer es 50/50 (Incondicional). La distribución del Rango es 50/50 asumiendo BSD (Condicional).
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <TrendingDown className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                        <p className="text-[10px] text-white/50 leading-relaxed">
                            <span className="text-white font-bold block mb-1">Anomalía de Rango Alto</span>
                            Los rangos r ≥ 2 tienen densidad 0 en el límite, lo que explica por qué son tan difíciles de encontrar y verificar analíticamente.
                        </p>
                    </div>
                </div>
            </div>

            <div className="absolute top-0 right-0 p-2 opacity-10">
                <PieChart className="w-24 h-24 text-white" />
            </div>
        </motion.div>
    );
};
