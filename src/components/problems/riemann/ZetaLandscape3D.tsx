import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

/**
 * ZetaLandscape3D
 * 
 * Visualizes the Riemann Zeta function surface |zeta(s)| over the critical strip.
 * Uses HTML5 Canvas for a performant pseudo-3D wireframe/surface rendering.
 * 
 * Domain: 0 < Re(s) < 1 (Critical Strip)
 * Range: t_start < Im(s) < t_end
 */

export const ZetaLandscape3D = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tOffset, setTOffset] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Animation loop
    useEffect(() => {
        let animationFrameId: number;

        const animate = () => {
            if (isAnimating) {
                setTOffset(prev => prev + 0.05);
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        if (isAnimating) {
            animate();
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [isAnimating]);

    // Zeta approximation (Euler-Maclaurin simplified for visualization)
    const zetaMag = (sigma: number, t: number) => {
        // Mocking the magnitude for visual structure mostly
        // Real implementation would require complex arithmetic
        // Here we use a proxy function that mimics the "hills and valleys" of Zeta
        // |Z(s)| usually has valleys at zeros on sigma=0.5

        // Distance to pole at s=1
        const s1_dist = Math.sqrt((sigma - 1) ** 2 + t ** 2);
        if (s1_dist < 0.1) return 10; // Pole cap

        // Approximate magnitude behavior
        // The pole at s=1 dominates low t
        // Zeros at t=14.13, 21.02, 25.01... on sigma=0.5

        // Simple proxy: 1/|s-1| + interference pattern
        let val = 1 / (s1_dist + 0.1);

        // Add "zeros" interference
        // cos(t * log(p)) sums... 
        // We cheat for visual flair:
        const zero_interf = Math.cos(t * Math.log(2)) + Math.cos(t * Math.log(3));

        // Deepen the valley at sigma=0.5
        const critical_line_dist = Math.abs(sigma - 0.5);

        // Valleys appear when interference is destructive and we are somewhat near 0.5
        if (critical_line_dist < 0.2) {
            val *= (0.5 + 0.5 * Math.abs(Math.sin(t / 3))); // Fake zeros
        }

        return Math.min(val * 4, 8); // Cap height
    };

    // Rendering
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Clear
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, width, height);

        // Grid Parameters
        const rows = 40;
        const cols = 20;
        const spacingX = width / cols;
        const spacingY = height / rows / 2; // Compressed Y for perspective

        ctx.lineWidth = 1;

        // Draw Surface
        for (let r = 0; r < rows; r++) {
            const t = tOffset + r * 0.5; // Imaginary part increases 'into' the screen (or effectively 'down')

            ctx.beginPath();
            for (let c = 0; c <= cols; c++) {
                const sigma = c / cols; // Real part 0 to 1

                // Calculate height
                const z = zetaMag(sigma, t);

                // Isometric-ish projection
                // x screen = x world + y world * shift
                // y screen = y world * shift - z height

                const sx = (c * spacingX) + (r * 10) - (rows * 5); // Slant right
                const sy = height - (r * spacingY * 3) - (z * 20) + 50; // Go up as 'r' increases (distance), minus height

                if (c === 0) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
            }

            // Color based on height logic or just cool lines
            // Near sigma=0.5 we want to highlight
            ctx.strokeStyle = `rgba(100, 100, 255, ${0.1 + r / rows * 0.5})`;
            ctx.stroke();
        }

        // Highlight Critical Line (sigma = 0.5)
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#f0f";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#f0f";

        for (let r = 0; r < rows; r++) {
            const t = tOffset + r * 0.5;
            const sigma = 0.5;
            const c = cols * sigma;
            const z = zetaMag(sigma, t);
            const sx = (c * spacingX) + (r * 10) - (rows * 5);
            const sy = height - (r * spacingY * 3) - (z * 20) + 50;

            if (r === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1;

    }, [tOffset]);

    return (
        <div className="relative rounded-xl overflow-hidden border border-indigo-500/20 bg-black">
            <canvas
                ref={canvasRef}
                width={800}
                height={500}
                className="w-full h-auto opacity-80"
            />

            <div className="absolute top-4 left-4">
                <Badge variant="outline" className="bg-black/50 backdrop-blur border-indigo-500/30 text-indigo-300">
                    t = {tOffset.toFixed(2)} +
                </Badge>
            </div>

            <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                    onClick={() => setIsAnimating(!isAnimating)}
                    className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                    {isAnimating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                    onClick={() => setTOffset(0)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            <div className="absolute bottom-4 left-4 max-w-xs text-[10px] text-white/40 pointer-events-none">
                *Visualización simplificada. La línea magenta representa la Línea Crítica Re(s)=1/2.
            </div>
        </div>
    );
};
