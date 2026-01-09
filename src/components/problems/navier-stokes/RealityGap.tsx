import * as React from "react";
import * as d3 from 'd3';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, AlertTriangle } from 'lucide-react';

interface DataPoint {
    t: number;
    stable: number;
    euler: number;
}

const RealityGap = () => {
    const svgRef = React.useRef<SVGSVGElement>(null);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [time, setTime] = React.useState(0);
    const [history, setHistory] = React.useState<DataPoint[]>([]);

    const blowUpTime = 80;

    React.useEffect(() => {
        const newData: DataPoint[] = [];
        for (let t = 0; t <= 100; t++) {
            const stable = Math.exp(-t * 0.02);
            let euler;
            if (t < blowUpTime) {
                euler = 1 + 0.1 * Math.pow(t / blowUpTime, 4);
            } else {
                euler = 1.1 * Math.pow(1 / (1.01 - (t - blowUpTime) / 20), 2);
            }
            newData.push({ t, stable, euler: Math.min(euler, 5) });
        }
        setHistory(newData);
    }, []);

    React.useEffect(() => {
        if (!svgRef.current || history.length === 0) return;

        const margin = { top: 20, right: 30, bottom: 40, left: 50 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .html(null)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
        const y = d3.scaleLinear().domain([0, 5]).range([height, 0]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d => `t=${d}`));

        svg.append("g")
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}E`));

        const lineStable = d3.line<DataPoint>()
            .x(d => x(d.t))
            .y(d => y(d.stable))
            .curve(d3.curveBasis);

        svg.append("path")
            .datum(history.filter(d => d.t <= time))
            .attr("fill", "none")
            .attr("stroke", "#94a3b8")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "4,4")
            .attr("d", lineStable);

        const lineEuler = d3.line<DataPoint>()
            .x(d => x(d.t))
            .y(d => y(d.euler))
            .curve(d3.curveBasis);

        svg.append("path")
            .datum(history.filter(d => d.t <= time))
            .attr("fill", "none")
            .attr("stroke", "#ef4444")
            .attr("stroke-width", 3)
            .attr("d", lineEuler);

        if (time > 20) {
            svg.append("text")
                .attr("x", x(40))
                .attr("y", y(0.5))
                .attr("fill", "#94a3b8")
                .style("font-size", "10px")
                .style("font-family", "ui-monospace")
                .text("DISIPACIÓN NUMÉRICA (CGI)");
        }

        if (time >= blowUpTime) {
            svg.append("text")
                .attr("x", x(blowUpTime) - 40)
                .attr("y", y(4.5))
                .attr("fill", "#ef4444")
                .style("font-weight", "bold")
                .style("font-size", "12px")
                .style("font-family", "ui-monospace")
                .text("BLOW-UP DETECTADO (AI 2026)");

            svg.append("circle")
                .attr("cx", x(blowUpTime))
                .attr("cy", y(history[blowUpTime].euler))
                .attr("r", 6)
                .attr("fill", "#ef4444")
                .attr("stroke", "white");
        }
    }, [history, time]);

    React.useEffect(() => {
        let timer: number;
        if (isPlaying && time < 100) {
            timer = window.setInterval(() => {
                setTime(prev => Math.min(prev + 1, 100));
            }, 50);
        } else {
            setIsPlaying(false);
        }
        return () => clearInterval(timer);
    }, [isPlaying, time]);

    return (
        <Card className="bg-slate-950 border-slate-800">
            <CardHeader>
                <CardTitle className="text-xl font-mono text-slate-100 flex items-center gap-2">
                    <AlertTriangle className="text-amber-500 w-5 h-5" />
                    The Reality Gap: Stability vs. Singularity
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-6">
                    <div className="flex justify-center bg-black/40 p-4 rounded-lg border border-slate-800">
                        <svg ref={svgRef} className="max-w-full h-auto" />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="gap-2"
                            >
                                <Play className={`w-4 h-4 ${isPlaying ? 'fill-current' : ''}`} />
                                {time === 100 ? 'Replay' : isPlaying ? 'Pausar' : 'Simular Auditoría'}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setTime(0); setIsPlaying(false); }}
                                className="gap-2 text-slate-400"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default RealityGap;
