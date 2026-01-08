import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, History, Info } from "lucide-react";
import { motion } from "framer-motion";
import curvesData from "@/data/curves.json";

/**
 * BirchOriginPlot: Recreación del gráfico original de Birch-Swinnerton-Dyer (1960s).
 * Visualiza la divergencia del producto de Euler: 
 * f(X) = \prod_{p \le X} (N_p / p)  vs  log(log(X))
 */

type CurveKey = "496a1" | "32a3" | "389a1";

export const BirchOriginPlot = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [selectedCurve, setSelectedCurve] = useState<CurveKey>("389a1");

    // Preparar datos para D3
    const plotData = useEffect(() => {
        const svg = d3.select(svgRef.current);
        if (!svg.node()) return;

        const width = 600;
        const height = 400;
        const margin = { top: 40, right: 30, bottom: 60, left: 60 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        svg.selectAll("*").remove();

        const curve = curvesData[selectedCurve];
        const apSequence = curve.spectral_data.ap_sequence;
        const apPrimes = curve.spectral_data.ap_primes;

        // Calcular P(X) = \prod_{p \le X} (N_p / p)
        // N_p = p + 1 - a_p
        let currentProduct = 1.0;
        const data: { logLogX: number; product: number; p: number }[] = [];

        apPrimes.forEach((p, i) => {
            const ap = apSequence[i];
            const np = p + 1 - ap;
            currentProduct *= (np / p);

            // Usamos log(log(X)) como eje X, donde X es el primo actual p
            // Evitamos log(0)
            const xVal = Math.log(Math.log(p + 1));
            data.push({ logLogX: xVal, product: currentProduct, p });
        });

        const x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.logLogX) as [number, number])
            .range([0, innerWidth]);

        const y = d3.scaleLog()
            .domain(d3.extent(data, d => d.product) as [number, number])
            .range([innerHeight, 0]);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Ejes
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).ticks(5))
            .attr("color", "rgba(255,255,255,0.3)");

        g.append("g")
            .call(d3.axisLeft(y).ticks(5, "~s"))
            .attr("color", "rgba(255,255,255,0.3)");

        // Línea de regresión asintótica (GGU: Ground Truth Slope)
        // La pendiente debería ser proporcional al rango r
        const line = d3.line<{ logLogX: number; product: number }>()
            .x(d => x(d.logLogX))
            .y(d => y(d.product))
            .curve(d3.curveMonotoneX);

        // Sombreado de área
        const area = d3.area<{ logLogX: number; product: number }>()
            .x(d => x(d.logLogX))
            .y0(y(d3.min(data, d => d.product) || 0.1))
            .y1(d => y(d.product))
            .curve(d3.curveMonotoneX);

        const colors = {
            "496a1": { main: "#f59e0b", glow: "rgba(245, 158, 11, 0.3)" },
            "32a3": { main: "#22c55e", glow: "rgba(34, 197, 94, 0.3)" },
            "389a1": { main: "#a855f7", glow: "rgba(168, 85, 247, 0.4)" }
        };

        const activeColor = colors[selectedCurve];

        g.append("path")
            .datum(data)
            .attr("fill", activeColor.glow)
            .attr("d", area as any);

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", activeColor.main)
            .attr("stroke-width", 3)
            .attr("d", line as any);

        // Puntos individuales
        g.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.logLogX))
            .attr("cy", d => y(d.product))
            .attr("r", 2)
            .attr("fill", activeColor.main);

        // Etiquetas
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - 10)
            .attr("text-anchor", "middle")
            .attr("fill", "rgba(255,255,255,0.5)")
            .attr("font-size", "12px")
            .text("log(log(X))");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .attr("fill", "rgba(255,255,255,0.5)")
            .attr("font-size", "12px")
            .text("Π (N_p / p)");

    }, [selectedCurve]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-zinc-950 rounded-2xl border border-white/10 shadow-3xl"
        >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <History className="w-5 h-5 text-amber-500" />
                        <h3 className="text-xl font-bold text-white font-mono uppercase tracking-tight">
                            El Gráfico de Birch-Swinnerton-Dyer (1960)
                        </h3>
                    </div>
                    <p className="text-xs text-white/40 max-w-xl">
                        Reproducción de la observación original: para curvas de rango r, el producto acumulado de Np/p
                        se comporta asintóticamente como (log X)^r. En escala log-log, esto se visualiza como una pendiente r.
                    </p>
                </div>

                <Tabs value={selectedCurve} onValueChange={(v) => setSelectedCurve(v as CurveKey)}>
                    <TabsList className="bg-black/60 border border-white/10">
                        <TabsTrigger value="496a1" className="text-xs">496a1 (R=0)</TabsTrigger>
                        <TabsTrigger value="32a3" className="text-xs">32a3 (R=1)</TabsTrigger>
                        <TabsTrigger value="389a1" className="text-xs">389a1 (R=2)</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 flex justify-center bg-black/40 rounded-xl p-4 border border-white/5 relative group">
                    <svg
                        ref={svgRef}
                        viewBox="0 0 600 400"
                        preserveAspectRatio="xMidYMid meet"
                        className="w-full h-auto"
                    />

                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                        <Badge variant="outline" className="bg-amber-500/10 border-amber-500/20 text-amber-500 font-mono text-[10px]">
                            EDSAC COMPUTER SIMULATION
                        </Badge>
                        <div className="flex items-center gap-2 text-[10px] text-white/30 font-mono">
                            <Info className="w-3 h-3" />
                            <span>Pendiente Visual ≈ Rango</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <h4 className="text-[10px] font-bold text-white/40 uppercase mb-3 tracking-widest">Diagnóstico de Pendiente</h4>
                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] block text-white/30 mb-1">Rango Analítico</span>
                                <span className="text-2xl font-black text-white font-mono">
                                    {curvesData[selectedCurve].rank}
                                </span>
                            </div>
                            <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                                <span className="text-[10px] block text-amber-500/50 mb-1 font-bold">Veredicto de Birch (1960)</span>
                                <p className="text-[10px] text-white/60 leading-relaxed italic">
                                    "{curvesData[selectedCurve].rank === 0 ?
                                        "El producto converge a un valor constante. No hay puntos infinitos." :
                                        `El producto diverge positivamente. La pendiente sugiere la existencia de ${curvesData[selectedCurve].rank} punto(s) generadores.`}"
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/50">
                        <h4 className="text-[10px] font-bold text-white/40 uppercase mb-2">Contexto EDSAC</h4>
                        <p className="text-[10px] text-white/50 leading-relaxed">
                            Birch y Swinnerton-Dyer utilizaron la computadora EDSAC 2 en Cambridge para realizar
                            estos cálculos para miles de curvas. Su persistencia permitió ver la estructura
                            donde otros solo veían ruido numérico.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
