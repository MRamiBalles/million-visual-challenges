import React from 'react';
import { GlassBrain } from "@/components/ai/GlassBrain";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Cpu, Network, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const GlassRoom = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-cyan-500/30">
            {/* Header / Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Lab</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="font-mono text-sm tracking-widest text-green-500">CORTEX-13: ONLINE</span>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 pt-24 pb-12">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                    <div className="flex-1 space-y-6">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
                            The Glass Room
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                            Peer inside the mind of Cortex-13. Observe real-time activation patterns,
                            attention mechanism flows, and the emergence of mathematical intuition
                            within the neural substrate.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <Badge icon={<Cpu className="w-3 h-3" />} label="Hybrid Architecture" />
                            <Badge icon={<Network className="w-3 h-3" />} label="256d Model" />
                            <Badge icon={<Zap className="w-3 h-3" />} label="Live Inference" />
                        </div>

                        <div className="pt-4 flex gap-4">
                            <Button className="bg-white text-black hover:bg-gray-200">
                                Run Diagnostics
                            </Button>
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                Export State
                            </Button>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <Card className="w-full md:w-80 p-6 bg-black/40 border-white/10 backdrop-blur-xl">
                        <h3 className="font-mono text-xs text-gray-400 uppercase tracking-wider mb-4">System Metrics</h3>
                        <div className="space-y-4">
                            <Metric label="Validation Loss" value="0.0423" trend="-12%" />
                            <Metric label="Token Velocity" value="45 t/s" trend="+5%" />
                            <Metric label="Memory Usage" value="2.4 GB" />
                        </div>
                    </Card>
                </div>

                {/* The Glass Brain Viz */}
                <div className="w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_-10px_rgba(255,255,255,0.1)] mb-12 relative group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-10" />
                    <GlassBrain className="w-full h-full" />

                    {/* Overlay Controls */}
                    <div className="absolute bottom-6 left-6 z-20 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/80 backdrop-blur text-xs p-2 rounded border border-white/10 font-mono">
                            LAYER: 4/6
                        </div>
                        <div className="bg-black/80 backdrop-blur text-xs p-2 rounded border border-white/10 font-mono">
                            ATTN_HEADS: ACTIVE
                        </div>
                    </div>
                </div>

                {/* Explanation Section */}
                <div className="grid md:grid-cols-3 gap-8">
                    <Feature
                        title="Attention Maps"
                        description="Visualize how Cortex-13 attends to different parts of the mathematical sequence to infer relationships."
                    />
                    <Feature
                        title="Activation Sparsity"
                        description="Observe the sparse firing patterns of neurons associated with specific number theory concepts."
                    />
                    <Feature
                        title="Gradient Flow"
                        description="Track the backward pass during training sprints to understand learning efficiency."
                    />
                </div>
            </main>
        </div>
    );
};

// Simple UI Helpers
const Badge = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300">
        {icon}
        {label}
    </div>
);

const Metric = ({ label, value, trend }: { label: string, value: string, trend?: string }) => (
    <div className="flex justify-between items-end">
        <div>
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className="text-lg font-mono font-bold text-white">{value}</div>
        </div>
        {trend && (
            <div className={`text-xs ${trend.startsWith('-') ? 'text-green-400' : 'text-cyan-400'}`}>
                {trend}
            </div>
        )}
    </div>
);

const Feature = ({ title, description }: { title: string, description: string }) => (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-crosshair">
        <h3 className="text-lg font-semibold mb-2 text-gray-100">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
);

export default GlassRoom;
