/**
 * TopologicalHole.tsx
 * 
 * Visualization of Čech cohomology obstructions in logical problems.
 * Illustrates the failure to glue local solutions into a global one (H1 != 0).
 * 
 * Source: Azevedo et al., Curry (2025) - "Sheaf Theory and Contextuality"
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Share2, HelpCircle, AlertOctagon } from 'lucide-react';

interface Node {
    id: number;
    label: string;
}

interface Edge {
    source: number;
    target: number;
    constraint: string;
    is_obstruction?: boolean;
}

interface TopologyData {
    cases: {
        p_problem: {
            global_obstruction: boolean;
            h1_value: number;
            description: string;
        };
        np_problem: {
            global_obstruction: boolean;
            h1_value: number;
            description: string;
        };
    };
    visualization_data: {
        nodes: Node[];
        edges: Edge[];
    };
}

const mockData: TopologyData = {
    cases: {
        p_problem: {
            global_obstruction: false,
            h1_value: 0,
            description: "Global consistency confirmed: H1 = 0.",
        },
        np_problem: {
            global_obstruction: true,
            h1_value: 1,
            description: "Global inconsistency detected: H1 != 0.",
        },
    },
    visualization_data: {
        nodes: [
            { id: 0, label: "X0" },
            { id: 1, label: "X1" },
            { id: 2, label: "X2" },
            { id: 3, label: "X3" },
        ],
        edges: [
            { source: 0, target: 1, constraint: "X0 = X1" },
            { source: 1, target: 2, constraint: "X1 = X2" },
            { source: 2, target: 3, constraint: "X2 = X3" },
            { source: 3, target: 0, constraint: "X3 != X0", is_obstruction: true },
        ],
    },
};

interface TopologicalHoleProps {
    isDecoherent?: boolean; // Phase 14.5: Cascading Failure from CausalCone
}

export function TopologicalHole({ isDecoherent = false }: TopologicalHoleProps) {
    const [data, setData] = useState<TopologyData | null>(null);
    const [isHard, setIsHard] = useState(true);
    const [activeEdge, setActiveEdge] = useState<number | null>(null);
    const [lineModelMode, setLineModelMode] = useState(false);

    useEffect(() => {
        fetch('/data/topology_obstructions.json')
            .then((res) => res.json())
            .then((jsonData) => setData(jsonData))
            .catch(() => setData(mockData));
    }, []);

    if (!data) return null;

    const currentCase = isHard ? data.cases.np_problem : data.cases.p_problem;
    const nodes = data.visualization_data.nodes;
    const edges = data.visualization_data.edges;

    // Line Model Effect: Detect Hardy contextuality even if original H1 is 0
    // Phase 14.5: Decoherence FORCES H1 ≠ 0 (Patrascu: descent failure)
    const effectiveH1 = isDecoherent ? Infinity : (isHard && lineModelMode) ? 1 : currentCase.h1_value;
    const showHole = effectiveH1 !== 0;

    // Circle layout constants
    const radius = 80;
    const centerX = 150;
    const centerY = 150;

    const getNodePos = (id: number) => {
        const angle = (id / nodes.length) * 2 * Math.PI - Math.PI / 2;
        return {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
        };
    };

    return (
        <Card className={`bg-black/40 backdrop-blur-sm transition-all ${isDecoherent ? 'border-red-500/50 animate-pulse' : 'border-purple-500/30'}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className={`text-lg flex items-center gap-2 ${isDecoherent ? 'text-red-300' : 'text-purple-300'}`}>
                        {isDecoherent ? <AlertOctagon className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                        {isDecoherent ? 'Falla de Coherencia Categórica' : 'Obstrucción Topológica (Sheaves)'}
                    </CardTitle>
                    <div className="flex gap-2">
                        {isDecoherent && (
                            <Badge variant="outline" className="bg-red-900/30 text-red-400 border-red-500/50 animate-pulse">
                                🔥 Decoherence Induced
                            </Badge>
                        )}
                        <Badge
                            variant="outline"
                            className={showHole ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-green-500/20 text-green-300 border-green-500/30"}
                        >
                            $H^1$ = {isDecoherent ? '∞' : effectiveH1}
                            {lineModelMode && !isDecoherent && " (Line Model)"}
                        </Badge>
                    </div>
                </div>
                {isDecoherent && (
                    <p className="text-xs text-red-400 mt-1 font-mono">
                        Patrascu (2025): Thermal collapse ≅ Descent failure. Gluing impossible.
                    </p>
                )}
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* SVG Visualization */}
                    <div className={`relative w-[300px] h-[300px] bg-black/20 rounded-full p-4 transition-colors ${isDecoherent ? 'border-2 border-red-500/50' : 'border border-purple-500/10'}`}>
                        <svg width="100%" height="100%" viewBox="0 0 300 300">
                            {/* Edges */}
                            {edges.map((edge, idx) => {
                                const start = getNodePos(edge.source);
                                const end = getNodePos(edge.target);
                                const isObs = isHard && (edge.is_obstruction || lineModelMode);
                                const isActive = activeEdge === idx;

                                return (
                                    <motion.line
                                        key={`edge-${idx}`}
                                        x1={start.x}
                                        y1={start.y}
                                        x2={end.x}
                                        y2={end.y}
                                        stroke={isObs ? "#ef4444" : "#22c55e"}
                                        strokeWidth={isActive ? 4 : 2}
                                        strokeDasharray={isObs ? "4 4" : "0"}
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{
                                            pathLength: 1,
                                            opacity: 1,
                                            stroke: isObs ? "#ef4444" : "#22c55e"
                                        }}
                                        whileHover={{ strokeWidth: 4 }}
                                        onMouseEnter={() => setActiveEdge(idx)}
                                        onMouseLeave={() => setActiveEdge(null)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                );
                            })}

                            {/* Line Model Connections (Visual extra) */}
                            {lineModelMode && edges.map((edge, idx) => {
                                const start = getNodePos(edge.source);
                                const end = getNodePos(edge.target);
                                return (
                                    <circle key={`joint-${idx}`} cx={(start.x + end.x) / 2} cy={(start.y + end.y) / 2} r={3} fill="#8b5cf6" opacity={0.5} />
                                );
                            })}

                            {/* Nodes */}
                            {nodes.map((node) => {
                                const pos = getNodePos(node.id);
                                return (
                                    <motion.g key={`node-${node.id}`} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                        <circle
                                            cx={pos.x}
                                            cy={pos.y}
                                            r={12}
                                            fill="#1e1e2e"
                                            stroke="#8b5cf6"
                                            strokeWidth={2}
                                        />
                                        <text
                                            x={pos.x}
                                            y={pos.y}
                                            dy=".35em"
                                            textAnchor="middle"
                                            fill="white"
                                            fontSize="10"
                                            className="pointer-events-none select-none"
                                        >
                                            {node.label}
                                        </text>
                                    </motion.g>
                                );
                            })}
                        </svg>

                        {/* Overlay for "Hole" */}
                        {showHole && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 0.1 }}
                                    className="w-32 h-32 bg-red-500 rounded-full blur-xl"
                                />
                                <div className="text-red-500 font-mono text-xl font-bold opacity-30">H1 ≠ 0</div>
                            </div>
                        )}
                    </div>

                    {/* Controls & Description */}
                    <div className="flex-1 space-y-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsHard(false)}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${!isHard ? 'bg-green-500/20 text-green-300 border border-green-500/50' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
                            >
                                Instancia P-tiempo
                            </button>
                            <button
                                onClick={() => setIsHard(true)}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${isHard ? 'bg-red-500/20 text-red-300 border border-red-500/50' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
                            >
                                Instancia NP-completa
                            </button>
                        </div>

                        {/* Line Model Toggle */}
                        <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Line Model (Carù 2018)</span>
                                <input
                                    type="checkbox"
                                    checked={lineModelMode}
                                    onChange={(e) => setLineModelMode(e.target.checked)}
                                    className="w-3 h-3 accent-purple-500"
                                />
                            </div>
                            <p className="text-[10px] text-purple-200/60 leading-tight">
                                Evalúa la consistencia de secciones sobre la cobertura de líneas del escenario (Carù 2018), eliminando falsos negativos de Hardy.
                            </p>
                        </div>

                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-sm text-gray-300 leading-relaxed italic">
                                "{currentCase.description}"
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-purple-300">
                                <HelpCircle className="w-3 h-3" />
                                <span>Hover en aristas para ver restricciones locales</span>
                            </div>
                            <AnimatePresence mode="wait">
                                {activeEdge !== null && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="text-sm font-mono p-2 bg-purple-500/10 border border-purple-500/30 rounded"
                                    >
                                        Restricción: <span className="text-purple-400">{edges[activeEdge].constraint}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Legend/Note */}
                <div className="mt-4 p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20 flex gap-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-200/80">
                        <strong>Interpretación:</strong> La intratabilidad se manifiesta como una obstrucción circular en el haz lógico. Un $H^1 \neq 0$ indica que las soluciones locales no pueden unificarse en una sección global coherente.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
