import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Share2, Save, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Point {
    x: number;
    y: number;
}

interface Stroke {
    id: string;
    points: Point[];
    color: string;
    user_id: string;
    is_drawing: boolean;
}

interface Cursor {
    x: number;
    y: number;
    user_id: string;
    username: string;
    color: string;
    last_active: number;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

export const SharedWhiteboard = ({ sessionId = 'global-lobby' }: { sessionId?: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [cursors, setCursors] = useState<Record<string, Cursor>>({});
    const [myColor] = useState(COLORS[Math.floor(Math.random() * COLORS.length)]);
    const [isConnected, setIsConnected] = useState(false);

    // Auth & User info
    const userIdRef = useRef(`user-${Math.floor(Math.random() * 10000)}`);

    // 1. Initialize Realtime
    useEffect(() => {
        const channel = supabase.channel(`room:${sessionId}`, {
            config: {
                return() => {
    supabase.removeChannel(channel);
};
    }, [sessionId]);

// 2. Cursor Cleanup (remove inactive cursors > 5s)
useEffect(() => {
    const interval = setInterval(() => {
        const now = Date.now();
        setCursors(prev => {
            const next = { ...prev };
            let changed = false;
            Object.entries(next).forEach(([key, cursor]) => {
                if (now - cursor.last_active > 5000) {
                    delete next[key];
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
    }, 1000);
    return () => clearInterval(interval);
}, []);

// 3. Drawing Logic
const handlePointerDown = (e: React.PointerEvent) => {
    setIsDrawing(true);
    const point = getPoint(e);
    setCurrentStroke([point]);
};

const handlePointerMove = (e: React.PointerEvent) => {
    const point = getPoint(e);

    // Broadcast Cursor
    supabase.channel(`room:${sessionId}`).send({
        type: 'broadcast',
        event: 'cursor-pos',
        payload: {
            x: point.x,
            y: point.y,
            user_id: userIdRef.current,
            color: myColor,
            username: 'Anonymous', // TODO: Get from auth
        },
    });

    if (isDrawing) {
        setCurrentStroke(prev => [...prev, point]);
    }
};

const handlePointerUp = () => {
    setIsDrawing(false);
    if (currentStroke.length > 0) {
        const newStroke: Stroke = {
            id: crypto.randomUUID(),
            points: currentStroke,
            color: myColor,
            user_id: userIdRef.current,
            is_drawing: false
        };
        setStrokes(prev => [...prev, newStroke]);
        // Broadcast the full stroke (simpler than streaming points for now)
        supabase.channel(`room:${sessionId}`).send({
            type: 'broadcast',
            event: 'draw-stroke',
            payload: newStroke
        });
        setCurrentStroke([]);
    }
};

const getPoint = (e: React.PointerEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    };
};

// 4. Rendering Loop
useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Resize handling
    // For now fixed size, TODO: Make responsive
    canvas.width = 800;
    canvas.height = 600;

    const render = () => {
        // Clear
        ctx.fillStyle = '#0f172a'; // slate-950
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Grid
        ctx.strokeStyle = '#1e293b'; // slate-800
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < canvas.width; i += 40) { ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); }
        for (let i = 0; i < canvas.height; i += 40) { ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); }
        ctx.stroke();

        // Draw Shared Strokes
        strokes.forEach(stroke => {
            drawStroke(ctx, stroke.points, stroke.color);
        });

        // Draw Current Stroke
        if (currentStroke.length > 0) {
            drawStroke(ctx, currentStroke, myColor);
        }

        // Draw Cursors
        Object.values(cursors).forEach(cursor => {
            if (cursor.user_id !== userIdRef.current) {
                ctx.beginPath();
                ctx.arc(cursor.x, cursor.y, 5, 0, Math.PI * 2);
                ctx.fillStyle = cursor.color;
                ctx.fill();
                ctx.font = '10px monospace';
                ctx.fillText(cursor.username, cursor.x + 8, cursor.y + 4);
            }
        });

        requestAnimationFrame(render);
    };

    const drawStroke = (ctx: CanvasRenderingContext2D, points: Point[], color: string) => {
        if (points.length < 2) return;
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset
    };

    const animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
}, [strokes, currentStroke, cursors, myColor]);

return (
    <Card className="w-full bg-slate-950 border-slate-800 text-slate-200 overflow-hidden relative">
        {/* Toolbar */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
            <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg p-2 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: myColor }} />
                <span className="text-xs font-mono text-slate-400">
                    {isConnected ? 'Online' : 'Connecting...'}
                </span>
            </div>
        </div>

        <div className="absolute top-4 right-4 flex gap-2 z-10">
            <Button size="sm" variant="secondary" className="gap-2" onClick={() => toast.success("Copied Invite Link!")}>
                <Share2 className="w-4 h-4" /> Share
            </Button>
        </div>

        <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="w-full h-[600px] touch-none cursor-crosshair"
            style={{ width: '100%', height: '600px' }}
        />

        {/* Presence Overlay */}
        <div className="absolute bottom-4 left-4 flex -space-x-2">
            {Object.values(cursors).slice(0, 5).map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold" style={{ backgroundColor: c.color }}>
                    {c.username[0]}
                </div>
            ))}
            {Object.keys(cursors).length > 5 && (
                <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs">
                    +{Object.keys(cursors).length - 5}
                </div>
            )}
        </div>
    </Card>
);
};
