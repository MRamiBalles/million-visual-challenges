import React from 'react';
import { useWebSerial } from '@/hooks/useWebSerial';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plug, Unplug, Zap, Activity, Terminal } from 'lucide-react';

export const DeviceManager = () => {
    const { connect, disconnect, isConnected, incomingData } = useWebSerial();

    return (
        <Card className="p-6 bg-black border-slate-800 text-green-500 font-mono shadow-[0_0_20px_rgba(0,255,0,0.1)]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isConnected ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        {isConnected ? <Zap className="w-5 h-5" /> : <Unplug className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg tracking-wider">PHYSICAL_BRIDGE_V1</h3>
                        <div className="flex items-center gap-2 text-xs opacity-70">
                            <span>STATUS:</span>
                            <Badge variant={isConnected ? "default" : "destructive"} className="h-5 text-[10px]">
                                {isConnected ? 'ONLINE' : 'OFFLINE'}
                            </Badge>
                        </div>
                    </div>
                </div>

                <Button
                    variant={isConnected ? "destructive" : "default"}
                    onClick={isConnected ? disconnect : connect}
                    className="w-32"
                >
                    {isConnected ? (
                        <>
                            <Unplug className="w-4 h-4 mr-2" /> Disconnect
                        </>
                    ) : (
                        <>
                            <Plug className="w-4 h-4 mr-2" /> Connect
                        </>
                    )}
                </Button>
            </div>

            {/* Terminal Monitor */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest px-1">
                    <Terminal className="w-3 h-3" />
                    Incoming Data Stream (9600 BAUD)
                </div>
                <div className="h-48 rounded-lg border border-slate-800 bg-slate-950/50 p-4 relative overflow-hidden">
                    {/* CRT Scanline Effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>

                    <ScrollArea className="h-full">
                        <div className="space-y-1 font-mono text-sm">
                            {incomingData.length === 0 && (
                                <div className="text-slate-600 italic opacity-50 text-center py-12">
                                    Waiting for signal...
                                </div>
                            )}
                            {incomingData.map((data, idx) => (
                                <div key={idx} className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <span className="text-slate-600 shrink-0">
                                        [{new Date(data.timestamp).toISOString().split('T')[1].slice(0, -1)}]
                                    </span>
                                    <span className="text-green-400 break-all msg-glitch">
                                        {data.value}
                                    </span>
                                </div>
                            ))}
                            {isConnected && (
                                <div className="animate-pulse text-green-500">_</div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Signal Stats */}
            {isConnected && (
                <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="p-3 bg-slate-900/50 rounded border border-slate-800">
                        <div className="text-xs text-slate-500 mb-1">PACKETS/SEC</div>
                        <div className="text-xl font-bold flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-500" />
                            ~12
                        </div>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded border border-slate-800">
                        <div className="text-xs text-slate-500 mb-1">SIGNAL QUALITY</div>
                        <div className="text-xl font-bold text-green-500">98%</div>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded border border-slate-800">
                        <div className="text-xs text-slate-500 mb-1">LATENCY</div>
                        <div className="text-xl font-bold text-yellow-500">4ms</div>
                    </div>
                </div>
            )}
        </Card>
    );
};
