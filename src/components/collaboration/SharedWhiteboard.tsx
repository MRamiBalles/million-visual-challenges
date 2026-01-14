import React, { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Share2, LogIn, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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

interface RealtimePayload {
    x?: number;
    y?: number;
    user_id?: string;
    username?: string;
    color?: string;
    id?: string;
    points?: Point[];
    is_drawing?: boolean;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

// Rate limiting: max 60 messages per minute
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX_MESSAGES = 60;

// Stroke limits per session
const MAX_STROKES_PER_SESSION = 1000;

export const SharedWhiteboard = ({ sessionId = 'global-lobby' }: { sessionId?: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const navigate = useNavigate();
    
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [cursors, setCursors] = useState<Record<string, Cursor>>({});
    const [myColor] = useState(COLORS[Math.floor(Math.random() * COLORS.length)]);
    const [isConnected, setIsConnected] = useState(false);
    
    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('User');
    
    // Rate limiting state
    const messageTimestamps = useRef<number[]>([]);
    
    // Check authentication on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                
                if (user) {
                    setUserId(user.id);
                    setIsAuthenticated(true);
                    
                    // Fetch profile for username
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('username, display_name')
                        .eq('user_id', user.id)
                        .single();
                    
                    if (profile) {
                        setUsername(profile.display_name || profile.username || 'User');
                    }
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        
        checkAuth();
        
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUserId(session.user.id);
                setIsAuthenticated(true);
                
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('username, display_name')
                    .eq('user_id', session.user.id)
                    .single();
                
                if (profile) {
                    setUsername(profile.display_name || profile.username || 'User');
                }
            } else {
                setIsAuthenticated(false);
                setUserId(null);
                setUsername('User');
            }
        });
        
        return () => {
            subscription.unsubscribe();
        };
    }, []);
    
    // Rate limiter check
    const canSendMessage = useCallback(() => {
        const now = Date.now();
        // Remove timestamps outside the window
        messageTimestamps.current = messageTimestamps.current.filter(
            ts => now - ts < RATE_LIMIT_WINDOW_MS
        );
        
        if (messageTimestamps.current.length >= RATE_LIMIT_MAX_MESSAGES) {
            return false;
        }
        
        messageTimestamps.current.push(now);
        return true;
    }, []);

    // Initialize Realtime (only when authenticated)
    useEffect(() => {
        if (!isAuthenticated || !userId) return;
        
        const channel = supabase.channel(`room:${sessionId}`, {
            config: {
                presence: { key: userId },
                broadcast: { self: false, ack: true },
            },
        });

        channel
            .on('broadcast', { event: 'cursor-pos' }, ({ payload }: { payload: RealtimePayload }) => {
                if (payload.user_id && payload.x !== undefined && payload.y !== undefined) {
                    setCursors(prev => ({
                        ...prev,
                        [payload.user_id!]: {
                            x: payload.x!,
                            y: payload.y!,
                            user_id: payload.user_id!,
                            username: payload.username || 'User',
                            color: payload.color || '#888',
                            last_active: Date.now(),
                        },
                    }));
                }
            })
            .on('broadcast', { event: 'draw-stroke' }, ({ payload }: { payload: RealtimePayload }) => {
                if (payload.id && payload.points && payload.color && payload.user_id) {
                    // Check stroke limit
                    setStrokes(prev => {
                        if (prev.length >= MAX_STROKES_PER_SESSION) {
                            toast.error('Session stroke limit reached');
                            return prev;
                        }
                        const newStroke: Stroke = {
                            id: payload.id!,
                            points: payload.points!,
                            color: payload.color!,
                            user_id: payload.user_id!,
                            is_drawing: payload.is_drawing || false,
                        };
                        return [...prev, newStroke];
                    });
                }
            })
            .subscribe((status) => {
                setIsConnected(status === 'SUBSCRIBED');
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId, isAuthenticated, userId]);

    // Cursor Cleanup (remove inactive cursors > 5s)
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

    // Drawing Logic
    const handlePointerDown = (e: React.PointerEvent) => {
        if (!isAuthenticated) return;
        setIsDrawing(true);
        const point = getPoint(e);
        setCurrentStroke([point]);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isAuthenticated || !userId) return;
        
        const point = getPoint(e);

        // Rate limit cursor broadcasts
        if (canSendMessage()) {
            supabase.channel(`room:${sessionId}`).send({
                type: 'broadcast',
                event: 'cursor-pos',
                payload: {
                    x: point.x,
                    y: point.y,
                    user_id: userId,
                    color: myColor,
                    username: username,
                },
            });
        }

        if (isDrawing) {
            setCurrentStroke(prev => [...prev, point]);
        }
    };

    const handlePointerUp = () => {
        if (!isAuthenticated || !userId) return;
        
        setIsDrawing(false);
        if (currentStroke.length > 0) {
            // Check stroke limit before adding
            if (strokes.length >= MAX_STROKES_PER_SESSION) {
                toast.error('Session stroke limit reached (1000 strokes max)');
                setCurrentStroke([]);
                return;
            }
            
            // Rate limit stroke broadcasts
            if (!canSendMessage()) {
                toast.error('Rate limit reached. Please slow down.');
                setCurrentStroke([]);
                return;
            }
            
            const newStroke: Stroke = {
                id: crypto.randomUUID(),
                points: currentStroke,
                color: myColor,
                user_id: userId,
                is_drawing: false
            };
            setStrokes(prev => [...prev, newStroke]);
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
    
    const handleShare = () => {
        const shareUrl = `${window.location.origin}/market/whiteboard?session=${sessionId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            toast.success("Copied invite link!");
        }).catch(() => {
            toast.error("Failed to copy link");
        });
    };

    // Rendering Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        canvas.width = 800;
        canvas.height = 600;

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
            ctx.shadowBlur = 0;
        };

        const render = () => {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < canvas.width; i += 40) { ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); }
            for (let i = 0; i < canvas.height; i += 40) { ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); }
            ctx.stroke();

            strokes.forEach(stroke => {
                drawStroke(ctx, stroke.points, stroke.color);
            });

            if (currentStroke.length > 0) {
                drawStroke(ctx, currentStroke, myColor);
            }

            Object.values(cursors).forEach(cursor => {
                if (cursor.user_id !== userId) {
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

        const animationId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animationId);
    }, [strokes, currentStroke, cursors, myColor, userId]);

    // Loading state
    if (isLoading) {
        return (
            <Card className="w-full bg-slate-950 border-slate-800 text-slate-200 flex items-center justify-center h-[600px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-slate-400">Loading whiteboard...</p>
                </div>
            </Card>
        );
    }

    // Not authenticated - show login prompt
    if (!isAuthenticated) {
        return (
            <Card className="w-full bg-slate-950 border-slate-800 text-slate-200 flex items-center justify-center h-[600px]">
                <div className="flex flex-col items-center gap-6 text-center max-w-md px-8">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <LogIn className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Sign in to Collaborate</h3>
                        <p className="text-slate-400 text-sm">
                            The collaborative whiteboard requires authentication to prevent abuse 
                            and ensure accountability for all drawings.
                        </p>
                    </div>
                    <Button 
                        onClick={() => navigate('/auth')} 
                        className="gap-2"
                    >
                        <LogIn className="w-4 h-4" />
                        Sign In to Continue
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="w-full bg-slate-950 border-slate-800 text-slate-200 overflow-hidden relative">
            <div className="absolute top-4 left-4 flex gap-2 z-10">
                <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg p-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: myColor }} />
                    <span className="text-xs font-mono text-slate-400">
                        {isConnected ? `Online as ${username}` : 'Connecting...'}
                    </span>
                </div>
                <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-400">
                    Strokes: {strokes.length}/{MAX_STROKES_PER_SESSION}
                </div>
            </div>

            <div className="absolute top-4 right-4 flex gap-2 z-10">
                <Button size="sm" variant="secondary" className="gap-2" onClick={handleShare}>
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
