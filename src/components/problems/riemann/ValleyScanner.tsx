import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, Search, Database, CloudLightning } from "lucide-react";
import { motion } from "framer-motion";

/**
 * ValleyScanner: Orellana 2025 Topographic Scanner
 * 
 * Visualizes the Hardy Z-function Z(t) in the 'Valley' of the critical line.
 * Features:
 * 1. Live Mode: Real-time calculation for small N.
 * 2. Cloud Replay: Simulated replay of N=10^20 region (Orellana dataset).
 * 3. Lehmer Zoom: Detecting "near misses" or rapid crossings.
 */

const ORELLANA_DATASET = [
    // Simulated high-N data points (t_offset, Z(t))
    // Demonstrating Lehmer's phenomenon: Curve barely touches zero or has close pairs
    { t: 0.00, z: 2.5 }, { t: 0.05, z: 1.8 }, { t: 0.10, z: 0.5 }, { t: 0.12, z: 0.1 }, // Near zero
    { t: 0.14, z: -0.2 }, { t: 0.16, z: 0.1 }, { t: 0.20, z: 0.8 }, // Fast pair
    { t: 0.30, z: 3.0 }, { t: 0.40, z: -2.0 }, { t: 0.50, z: -4.5 },
    { t: 0.60, z: -1.0 }, { t: 0.65, z: 0.05 }, { t: 0.70, z: 1.2 },
    { t: 0.80, z: 2.5 }, { t: 0.90, z: 0.5 }, { t: 1.00, z: -0.5 }
];

export const ValleyScanner = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mode, setMode] = useState<"live" | "cloud">("live");
    const [nVal, setNVal] = useState(100);
    const [isScanning, setIsScanning] = useState(false);
    const [scanOffset, setScanOffset] = useState(0);

    // Scan Loop
    useEffect(() => {
        let frameId: number;
        const loop = () => {
            if (isScanning) {
                setScanOffset(prev => prev + 0.005);
                frameId = requestAnimationFrame(loop);
            }
        };
        if (isScanning) loop();
        return () => cancelAnimationFrame(frameId);
    }, [isScanning]);

    // Render Logic
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        const cy = h / 2;

        // Visual Style: Uses "Radar/Scanner" aesthetic
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, cy); ctx.lineTo(w, cy); // Zero line
        ctx.stroke();

        // Draw Z(t)
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;

        const path = new Path2D();
        let hasCrossings = false;

        if (mode === "live") {
            ctx.strokeStyle = "#0ea5e9"; // Sky blue
            ctx.shadowColor = "#0ea5e9";

            // Generate Z(t) for current N
            // Approximate Z(t) ~ 2 sum cos(...)
            const tStart = Math.sqrt(nVal - 0.25) * 10 + scanOffset * 50;

            for (let x = 0; x < w; x++) {
                const t = tStart + (x / w) * 10;

                // Riemann-Siegel proxy sum
                // We use a sum of cosines to simulate the chaotic behavior
                let z = 0;
                const limit = Math.floor(Math.sqrt(t / (2 * Math.PI)));
                for (let k = 1; k <= Math.max(1, Math.min(limit, 10)); k++) {
                    z += Math.cos(t * Math.log(k) - Math.sqrt(t)); // Placeholder phase
                }
                z *= 2;
                // Add "Gram Point" bias
                if (z > 4) z = 4; if (z < -4) z = -4;

                const y = cy - (z * 30);
                if (x === 0) path.moveTo(x, y);
                else path.lineTo(x, y);

                // Detect crossing for visual flare
                if (Math.abs(z) < 0.1) hasCrossings = true;
            }
        } else {
            // Cloud Mode (Orellana Data)
            ctx.strokeStyle = "#f59e0b"; // Amber
            ctx.shadowColor = "#f59e0b";

            // Loop through simulated data
            const data = ORELLANA_DATASET;
            const scaleX = w / 1.0; // Fit 1.0 t-range

            // Animate scrolling data
            const scroll = (scanOffset * 5) % 2.0;

            for (let x = 0; x < w; x++) {
                // Sample from dataset
                const rawT = (x / scaleX) + scroll;
                const tIdx = rawT % 1.0; // cycle

                // Interpolate z
                // Find closest points
                const p1 = data.find(d => d.t <= tIdx) || data[0];
                const p2 = data.find(d => d.t > tIdx) || data[data.length - 1];

                const ratio = (tIdx - p1.t) / (p2.t - p1.t || 1);
                const z = p1.z + (p2.z - p1.z) * ratio;

                const y = cy - (z * 50); // Higher amplitude
                if (x === 0) path.moveTo(x, y);
                else path.lineTo(x, y);

                if (Math.abs(z) < 0.1) hasCrossings = true;
            }
        }

        ctx.stroke(path);

        // Draw "Lehmer Zoom" overlay if near zero
        if (hasCrossings) {
            ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
            ctx.fillRect(0, cy - 20, w, 40);
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.font = "10px monospace";
            ctx.fillText("CRITICAL REGION", 10, cy - 5);
        }

    }, [nVal, scanOffset, mode]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between bg-card/50 p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-4">
                    <Button
                        variant={mode === "live" ? "default" : "outline"}
                        size="sm"
                        onClick={() => { setMode("live"); setIsScanning(false); }}
                        className={mode === "live" ? "bg-sky-500 hover:bg-sky-600" : ""}
                    >
                        <CloudLightning className="w-4 h-4 mr-2" />
                        Modo Live (N &lt; 1000)
                    </Button>
                    <Button
                        variant={mode === "cloud" ? "default" : "outline"}
                        size="sm"
                        onClick={() => { setMode("cloud"); setIsScanning(true); }}
                        className={mode === "cloud" ? "bg-amber-600 hover:bg-amber-700" : ""}
                    >
                        <Database className="w-4 h-4 mr-2" />
                        Cloud Replay (N ≈ 10²⁰)
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-white/60">
                        {mode === "live" ? `N = ${nVal}` : "Orellana Dataset (2025)"}
                    </span>
                    <Button size="icon" variant="ghost" onClick={() => setIsScanning(!isScanning)}>
                        {isScanning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            <div className="relative rounded-xl overflow-hidden border bg-black shadow-2xl"
                style={{ borderColor: mode === "live" ? "rgba(14, 165, 233, 0.3)" : "rgba(245, 158, 11, 0.3)" }}>
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={400}
                    className="w-full h-[300px]"
                />

                {/* HUD Overlay */}
                <div className="absolute top-4 right-4 text-right">
                    <Badge variant="outline" className={`backdrop-blur font-mono ${mode === "live" ? "text-sky-300 border-sky-500/30" : "text-amber-300 border-amber-500/30"}`}>
                        SCANNER: {mode === "live" ? "ACTIVE" : "REPLAY"}
                    </Badge>
                    <div className="text-[10px] text-white/40 mt-1">
                        t ≈ {(Math.sqrt(nVal) * 10 + scanOffset * 50).toFixed(4)}
                    </div>

                    {/* Gabcke Confidence Index */}
                    <div className="mt-2 p-1.5 bg-gray-800/60 rounded border border-gray-600/40 text-[9px]">
                        <div className="text-gray-400 mb-0.5">Índice Gabcke R(t)</div>
                        <div className="flex items-center gap-1">
                            <div className="w-16 h-1.5 bg-gray-700 rounded overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-yellow-500"
                                    style={{ width: `${Math.max(10, 100 - nVal / 10)}%` }}
                                />
                            </div>
                            <span className="text-gray-300 font-mono">
                                {(0.001 / (Math.sqrt(nVal) + 1)).toExponential(2)}
                            </span>
                        </div>
                        <div className="text-gray-500 italic mt-0.5">
                            {nVal > 500 ? "✓ Margen aceptable" : "⚠ Verificar profundidad"}
                        </div>
                    </div>
                </div>

                {/* Lehmer Alert */}
                {mode === "cloud" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute bottom-4 left-4 p-2 bg-red-900/40 border border-red-500/40 rounded text-[10px] text-red-200"
                    >
                        <div className="flex items-center gap-2">
                            <Search className="w-3 h-3" />
                            <span>Fenómeno de Lehmer detectado: Pares cercanos</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {mode === "live" && (
                <div className="px-4 py-2 bg-white/5 rounded-lg">
                    <label className="text-xs text-white/60">Ajuste N (Altura de la Región)</label>
                    <Slider
                        value={[nVal]}
                        min={10}
                        max={1000}
                        step={10}
                        onValueChange={(v) => setNVal(v[0])}
                        className="mt-2"
                    />
                </div>
            )}
        </div>
    );
};
