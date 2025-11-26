import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

export const TopologicalSphere = () => {
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

            ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            time += 0.01;

            // Draw 3D sphere projection with rotation
            const numLatitudes = 12;
            const numLongitudes = 16;
            const radius = 100;

            // Rotation angles
            const rotY = time * 0.5;
            const rotX = Math.sin(time * 0.3) * 0.3;

            // Draw latitudes
            for (let lat = 0; lat < numLatitudes; lat++) {
                const phi = (lat / (numLatitudes - 1)) * Math.PI;

                ctx.strokeStyle = `hsla(200, 70%, 50%, ${0.3 + 0.2 * Math.sin(lat + time)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();

                let firstPoint = true;
                for (let lon = 0; lon <= numLongitudes; lon++) {
                    const theta = (lon / numLongitudes) * Math.PI * 2;

                    // 3D sphere coordinates
                    let x = radius * Math.sin(phi) * Math.cos(theta);
                    let y = radius * Math.sin(phi) * Math.sin(theta);
                    let z = radius * Math.cos(phi);

                    // Rotate around Y axis
                    const x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
                    const z1 = x * Math.sin(rotY) + z * Math.cos(rotY);

                    // Rotate around X axis
                    const y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
                    const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);

                    // Perspective projection
                    const scale = 200 / (200 + z2);
                    const screenX = centerX + x1 * scale;
                    const screenY = centerY + y2 * scale;

                    if (firstPoint) {
                        ctx.moveTo(screenX, screenY);
                        firstPoint = false;
                    } else {
                        ctx.lineTo(screenX, screenY);
                    }
                }
                ctx.stroke();
            }

            // Draw longitudes
            for (let lon = 0; lon < numLongitudes; lon++) {
                const theta = (lon / numLongitudes) * Math.PI * 2;

                ctx.strokeStyle = `hsla(200, 70%, 50%, ${0.3 + 0.2 * Math.sin(lon + time)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();

                let firstPoint = true;
                for (let lat = 0; lat <= numLatitudes; lat++) {
                    const phi = (lat / numLatitudes) * Math.PI;

                    // 3D sphere coordinates
                    let x = radius * Math.sin(phi) * Math.cos(theta);
                    let y = radius * Math.sin(phi) * Math.sin(theta);
                    let z = radius * Math.cos(phi);

                    // Rotate around Y axis
                    const x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
                    const z1 = x * Math.sin(rotY) + z * Math.cos(rotY);

                    // Rotate around X axis
                    const y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
                    const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);

                    // Perspective projection
                    const scale = 200 / (200 + z2);
                    const screenX = centerX + x1 * scale;
                    const screenY = centerY + y2 * scale;

                    if (firstPoint) {
                        ctx.moveTo(screenX, screenY);
                        firstPoint = false;
                    } else {
                        ctx.lineTo(screenX, screenY);
                    }
                }
                ctx.stroke();
            }

            // Highlight "north and south poles"
            const poles = [
                { phi: 0, label: 'Polo Norte' },
                { phi: Math.PI, label: 'Polo Sur' }
            ];

            poles.forEach((pole, i) => {
                let x = radius * Math.sin(pole.phi) * Math.cos(0);
                let y = radius * Math.sin(pole.phi) * Math.sin(0);
                let z = radius * Math.cos(pole.phi);

                // Rotate
                const x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
                const z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
                const y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
                const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);

                // Project
                const scale = 200 / (200 + z2);
                const screenX = centerX + x1 * scale;
                const screenY = centerY + y2 * scale;

                const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, 15);
                gradient.addColorStop(0, `hsl(${i * 180 + 60}, 80%, 70%)`);
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(screenX, screenY, 15, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(screenX, screenY, 4, 0, Math.PI * 2);
                ctx.fill();
            });

            // Title and info
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('3-Esfera Topológica', centerX, 30);

            ctx.font = '12px monospace';
            ctx.fillText('Simplemente Conexa', centerX, 50);

            // Info panel
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(10, canvas.height - 100, 320, 90);

            ctx.fillStyle = '#aaa';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('Una 3-variedad compacta es simplemente conexa si:', 20, canvas.height - 80);
            ctx.fillText('• Todo lazo se puede contraer a un punto', 20, canvas.height - 60);
            ctx.fillText('• Poincaré conjeturó que debe ser homeomorfa', 20, canvas.height - 40);
            ctx.fillText('  a la 3-esfera S³', 20, canvas.height - 20);

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
                Proyección en 2D de una <strong>3-esfera</strong> (S³). La Conjetura de Poincaré afirma
                que toda 3-variedad compacta simplemente conexa es homeomorfa (equivalente topológicamente)
                a S³. "Simplemente conexa" significa que cualquier lazo cerrado se puede contraer
                continuamente a un punto.
            </p>
        </div>
    );
};
