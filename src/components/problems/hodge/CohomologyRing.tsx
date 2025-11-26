import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

export const CohomologyRing = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const animationRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        let time = 0;

        const animate = () => {
            if (!isPlaying) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }

            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            time += 0.02;

            // Draw cohomology "rings" at different levels
            const levels = ['H⁰', 'H²', 'H⁴', 'H⁶'];
            const yPositions = [80, 160, 240, 320];

            levels.forEach((level, idx) => {
                const y = yPositions[idx];
                const numNodes = idx + 2;

                // Draw level label
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px monospace';
                ctx.textAlign = 'right';
                ctx.fillText(level, 50, y + 5);

                // Draw nodes in this cohomology level
                for (let i = 0; i < numNodes; i++) {
                    const x = 100 + (i * (canvas.width - 150)) / Math.max(numNodes - 1, 1);
                    const phase = time + idx + i * 0.5;

                    // Node glow
                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
                    gradient.addColorStop(0, `hsl(${(idx * 90 + i * 30) % 360}, 70%, 60%)`);
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, y, 20, 0, Math.PI * 2);
                    ctx.fill();

                    // Node core
                    ctx.fillStyle = `hsl(${(idx * 90 + i * 30) % 360}, 80%, 70%)`;
                    ctx.beginPath();
                    ctx.arc(x, y, 8, 0, Math.PI * 2);
                    ctx.fill();

                    // Pulsing effect
                    ctx.strokeStyle = `hsla(${(idx * 90 + i * 30) % 360}, 80%, 70%, ${0.5 + 0.5 * Math.sin(phase)})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(x, y, 12 + 4 * Math.sin(phase), 0, Math.PI * 2);
                    ctx.stroke();
                }

                // Draw connections between levels (cup product)
                if (idx < levels.length - 1) {
                    const nextY = yPositions[idx + 1];
                    const nextNumNodes = idx + 3;

                    for (let i = 0; i < numNodes; i++) {
                        for (let j = 0; j < nextNumNodes; j++) {
                            const x1 = 100 + (i * (canvas.width - 150)) / Math.max(numNodes - 1, 1);
                            const x2 = 100 + (j * (canvas.width - 150)) / Math.max(nextNumNodes - 1, 1);

                            ctx.strokeStyle = `rgba(100, 150, 200, ${0.1 + 0.1 * Math.sin(time + i + j)})`;
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(x1, y + 10);
                            ctx.lineTo(x2, nextY - 10);
                            ctx.stroke();
                        }
                    }
                }
            });

            // Title
            ctx.fillStyle = '#aaa';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Anillo de Cohomología', centerX, 30);
            ctx.font = '11px sans-serif';
            ctx.fillText('(Estructura algebraica en grupos de cohomología)', centerX, 50);

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying]);

    return (
        <div className="space-y-4">
            <canvas
                ref={canvasRef}
                className="w-full h-96 bg-black rounded-lg border border-border"
            />

            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isPlaying ? "Pausar" : "Reproducir"}
                </Button>
            </div>

            <p className="text-sm text-muted-foreground">
                Representación del <strong>anillo de cohomología</strong> de una variedad algebraica.
                Los niveles H⁰, H², H⁴, H⁶ representan diferentes grados de cohomología. Las conexiones
                muestran el "cup product" que da estructura de anillo a la cohomología.
            </p>
        </div>
    );
};
