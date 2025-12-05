import React, { useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HapticEngine } from '@/lib/hardware/HapticEngine';
import { Activity, MousePointer2 } from 'lucide-react';

export const MathFeeler = () => {
    const [error, setError] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const haptics = HapticEngine.getInstance();

    const drawCurve = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.clearRect(0, 0, width, height);

        // Draw Target Curve (Parabola: y = x^2 scaled)
        ctx.beginPath();
        ctx.strokeStyle = '#3b82f6'; // blue-500
        ctx.lineWidth = 4;
        for (let x = 0; x < width; x++) {
            // Normalized X (-1 to 1)
            const nx = (x / width) * 2 - 1;
            const ny = nx * nx; // y = x^2

            // Map back to screen Y (inverted)
            const sy = height - (ny * height * 0.8 + height * 0.1);
            if (x === 0) ctx.moveTo(x, sy);
            else ctx.lineTo(x, sy);
        }
        ctx.stroke();

        // Guide Text
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px monospace';
        ctx.fillText("y = x²", width / 2 - 20, height - 20);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        drawCurve(canvas.getContext('2d')!, canvas.width, canvas.height);
    }, []);

    const handleMove = (e: React.PointerEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate theoretical Y for this X
        const nx = (x / canvas.width) * 2 - 1;
        const targetNy = nx * nx;
        const targetY = canvas.height - (targetNy * canvas.height * 0.8 + canvas.height * 0.1);

        // Distance = Error
        const dist = Math.abs(y - targetY);
        const maxDist = canvas.height / 2;

        // Normalize Error (0 to 1)
        const normalizedError = Math.min(dist / maxDist, 1);
        setError(normalizedError);

        // Feedback Logic
        // Threshold: If error > 10px, start feeling it
        if (dist > 10) {
            haptics.feel(normalizedError);
        }
    };

    return (
        <Card className="p-6 bg-slate-900 border-slate-800">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Activity className={`w-5 h-5 ${error < 0.1 ? 'text-green-500' : 'text-red-500'}`} />
                    <h3 className="font-bold text-slate-200">Haptic Surface</h3>
                </div>
                <Badge variant={error < 0.1 ? "default" : "destructive"}>
                    Error: {(error * 100).toFixed(0)}%
                </Badge>
            </div>

            <div className="relative rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-950 cursor-crosshair touch-none">
                <div className="absolute top-4 left-4 text-xs text-slate-500 pointer-events-none">
                    <MousePointer2 className="w-4 h-4 inline mr-1" />
                    Trace the blue line. Feeling friction means error.
                </div>

                <canvas
                    ref={canvasRef}
                    width={600}
                    height={300}
                    className="w-full h-[300px]"
                    onPointerMove={handleMove}
                    onPointerLeave={() => setError(0)}
                />

                {/* Visual Error Overlay */}
                <div
                    className="absolute inset-0 pointer-events-none transition-colors duration-75"
                    style={{ backgroundColor: `rgba(239, 68, 68, ${error * 0.3})` }} // Red flash on error
                />
            </div>
        </Card>
    );
};
