import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Play, RotateCcw, Plus, Trash2, Zap, BrainCircuit } from "lucide-react";
import { toast } from "sonner";
import { ProblemGenerator } from "@/lib/generators/ProblemGenerator";

interface Point {
    x: number;
    y: number;
}

interface TSPVisualizerProps {
    seed?: string;
}

export const TSPVisualizer = ({ seed }: TSPVisualizerProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cities, setCities] = useState<Point[]>([]);
    const [path, setPath] = useState<number[]>([]);
    const [isComputing, setIsComputing] = useState(false);
    const [algorithm, setAlgorithm] = useState<"brute" | "nearest" | null>(null);
    const [stats, setStats] = useState({ distance: 0, operations: 0, time: 0 });

    // Init with some random cities or seed
    useEffect(() => {
        if (cities.length === 0) {
            if (seed) {
                const gen = new ProblemGenerator(seed);
                const newCities = gen.generateTSP(12, 800, 500);
                setCities(newCities);
            } else {
                generateRandomCities(6);
            }
        }
    }, [seed]);

    useEffect(() => {
        draw();
    }, [cities, path]);

    const generateRandomCities = (count: number) => {
        const newCities: Point[] = [];
        for (let i = 0; i < count; i++) {
            newCities.push({
                x: Math.random() * 800,
                y: Math.random() * 500
            });
        }
        setCities(newCities);
        setPath([]);
        setAlgorithm(null);
    };

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isComputing) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = (e.clientX - rect.left) * (canvasRef.current!.width / rect.width);
        const y = (e.clientY - rect.top) * (canvasRef.current!.height / rect.height);

        if (cities.length >= 12) {
            toast.warning("Cannot add more cities. Brute force would take centuries!");
            return;
        }
        setCities([...cities, { x, y }]);
        setPath([]); // Clear path on change
    };

    const calculateDistance = (p1: Point, p2: Point) => {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    };

    const getTotalDistance = (indices: number[]) => {
        let dist = 0;
        for (let i = 0; i < indices.length - 1; i++) {
            dist += calculateDistance(cities[indices[i]], cities[indices[i + 1]]);
        }
        // Return to start
        if (indices.length > 1) {
            dist += calculateDistance(cities[indices[indices.length - 1]], cities[indices[0]]);
        }
        return dist;
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = "#ffffff10";
        ctx.beginPath();
        for (let i = 0; i < canvas.width; i += 50) { ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); }
        for (let i = 0; i < canvas.height; i += 50) { ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); }
        ctx.stroke();

        // Draw Path
        if (path.length > 0) {
            ctx.strokeStyle = algorithm === 'brute' ? '#ef4444' : '#22c55e';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cities[path[0]].x, cities[path[0]].y);
            for (let i = 1; i < path.length; i++) {
                ctx.lineTo(cities[path[i]].x, cities[path[i]].y);
            }
            ctx.closePath();
            ctx.stroke();
        }

        // Draw Cities
        cities.forEach((city, i) => {
            ctx.fillStyle = "#3b82f6";
            ctx.beginPath();
            ctx.arc(city.x, city.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.font = "12px monospace";
            ctx.fillText(i.toString(), city.x - 4, city.y + 4);
        });
    };

    const solveNearestNeighbor = async () => {
        if (cities.length < 2) return;
        setIsComputing(true);
        setAlgorithm("nearest");

        const start = performance.now();
        let operations = 0;

        const visited = new Set([0]);
        const newPath = [0];
        let current = 0;

        while (visited.size < cities.length) {
            let nearest = -1;
            let minDesc = Infinity;

            for (let i = 0; i < cities.length; i++) {
                operations++;
                if (!visited.has(i)) {
                    const d = calculateDistance(cities[current], cities[i]);
                    if (d < minDesc) {
                        minDesc = d;
                        nearest = i;
                    }
                }
            }

            if (nearest !== -1) {
                visited.add(nearest);
                newPath.push(nearest);
                current = nearest;
                setPath([...newPath]);
                await new Promise(r => setTimeout(r, 100)); // Visualize steps
            }
        }

        setStats({
            distance: Math.floor(getTotalDistance(newPath)),
            operations,
            time: Math.floor(performance.now() - start)
        });
        setIsComputing(false);
    };

    const solveBruteForce = async () => {
        if (cities.length > 10) {
            toast.error("Too many cities for Brute Force! Reduce to < 10.");
            return;
        }
        setIsComputing(true);
        setAlgorithm("brute");

        const start = performance.now();
        let operations = 0;
        let bestPath: number[] = [];
        let minDistance = Infinity;

        const permute = async (arr: number[], m: number[] = []): Promise<void> => {
            if (arr.length === 0) {
                operations++;
                const currentDist = getTotalDistance([0, ...m]);
                if (currentDist < minDistance) {
                    minDistance = currentDist;
                    bestPath = [0, ...m];
                    setPath(bestPath);
                }
                if (operations % 1000 === 0) await new Promise(r => setTimeout(r, 0));
            } else {
                for (let i = 0; i < arr.length; i++) {
                    const curr = arr.slice();
                    const next = curr.splice(i, 1);
                    await permute(curr.slice(), m.concat(next));
                }
            }
        };

        // Fix start city at 0 to reduce N! to (N-1)!
        const citiesIndices = cities.map((_, i) => i).slice(1);
        await permute(citiesIndices);

        setStats({
            distance: Math.floor(minDistance),
            operations,
            time: Math.floor(performance.now() - start)
        });
        setIsComputing(false);
    };

    return (
        <div className="flex flex-col h-full bg-black/40 text-white relative">
            <div className="absolute top-4 left-4 z-10 space-y-2">
                <Card className="p-3 bg-black/80 backdrop-blur border-white/10 w-64">
                    <h4 className="font-bold text-sm mb-2 text-cyan-400">Control Panel</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <Button size="sm" variant="secondary" onClick={() => generateRandomCities(6)} disabled={isComputing}>
                            <RotateCcw className="w-3 h-3 mr-1" /> Reset
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setCities([])} disabled={isComputing}>
                            <Trash2 className="w-3 h-3 mr-1" /> Clear
                        </Button>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">Algorithms:</div>
                    <div className="space-y-2">
                        <Button
                            size="sm"
                            className="w-full bg-green-600 hover:bg-green-500"
                            onClick={solveNearestNeighbor}
                            disabled={isComputing || cities.length < 2}
                        >
                            <Zap className="w-3 h-3 mr-2" /> Nearest Neighbor (P)
                        </Button>
                        <Button
                            size="sm"
                            className="w-full bg-red-600 hover:bg-red-500"
                            onClick={solveBruteForce}
                            disabled={isComputing || cities.length < 2}
                        >
                            <BrainCircuit className="w-3 h-3 mr-2" /> Brute Force (NP)
                        </Button>
                    </div>
                </Card>

                {stats.operations > 0 && (
                    <Card className="p-3 bg-black/80 backdrop-blur border-white/10 w-64 animate-in slide-in-from-left">
                        <h4 className="font-bold text-sm mb-2 text-cyan-400">Results</h4>
                        <div className="space-y-1 text-xs font-mono">
                            <div className="flex justify-between"><span>Distance:</span> <span className="text-white">{stats.distance} px</span></div>
                            <div className="flex justify-between"><span>Operations:</span> <span className="text-white">{stats.operations.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span>Time:</span> <span className="text-white">{stats.time} ms</span></div>
                        </div>
                    </Card>
                )}
            </div>

            <canvas
                ref={canvasRef}
                width={800}
                height={500}
                onClick={handleCanvasClick}
                className="w-full h-full cursor-crosshair touch-none"
            />

            <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none">
                <p className="text-sm text-white/50 bg-black/50 inline-block px-3 py-1 rounded-full backdrop-blur">
                    Click canvas to add cities. (Max 10 for Brute Force)
                </p>
            </div>
        </div>
    );
};
