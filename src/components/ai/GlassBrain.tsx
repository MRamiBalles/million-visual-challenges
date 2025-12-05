import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Instance, Instances, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

// Types representing the exported data from PyTorch
interface GlassBoxData {
    config: {
        n_layers: number;
        d_model: number;
        n_heads: number;
    };
    activations?: Record<string, number[][]>; // [Layer, Neurons]
    attention?: Record<string, number[][][]>; // [Layer, Head, Seq, Seq]
}

const MOCK_CONFIG = {
    n_layers: 4,
    d_model: 64, // Reduced for visual clarity
    n_heads: 4
};

// --- Sub-components ---

const Neuron = ({ position, active, color }: { position: [number, number, number], active: number, color: string }) => {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        if (active > 0.1) {
            meshRef.current.scale.setScalar(1 + active * 0.5 * Math.sin(state.clock.elapsedTime * 5));
        }
    });

    return (
        <mesh ref={meshRef} position={position}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={active * 2}
                transparent
                opacity={0.8}
            />
        </mesh>
    );
};

const Layer = ({ layerIndex, numNeurons, activations }: { layerIndex: number, numNeurons: number, activations?: number[] }) => {
    // layout neurons in a grid
    const gridSize = Math.ceil(Math.sqrt(numNeurons));
    const spacing = 0.3;

    const neurons = useMemo(() => {
        return Array.from({ length: numNeurons }).map((_, i) => {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            return {
                id: i,
                pos: [
                    (col - gridSize / 2) * spacing,
                    (row - gridSize / 2) * spacing,
                    0
                ] as [number, number, number],
                active: activations ? activations[i] : Math.random() > 0.8 ? Math.random() : 0
            };
        });
    }, [numNeurons, activations]);

    return (
        <group position={[0, 0, layerIndex * 2]}>
            {/* Layer Label */}
            <Text
                position={[-gridSize * spacing, gridSize * spacing / 2 + 0.5, 0]}
                fontSize={0.3}
                color="white"
                anchorX="left"
            >
                LAYER {layerIndex}
            </Text>

            {/* Neurons */}
            {neurons.map((n) => (
                <Neuron
                    key={n.id}
                    position={n.pos}
                    active={n.active}
                    color={layerIndex % 2 === 0 ? "#00ffff" : "#ff00ff"}
                />
            ))}

            {/* Base Plane (optional context) */}
            <mesh position={[0, 0, -0.1]}>
                <planeGeometry args={[gridSize * spacing * 1.2, gridSize * spacing * 1.2]} />
                <meshBasicMaterial color="black" transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};

const Synapses = ({ layerIndex, numNeurons, intensity = 0.5 }: { layerIndex: number, numNeurons: number, intensity?: number }) => {
    // Visualize connections between layers (simplified attention)
    // Only drawing a random subset to avoid clutter
    const gridSize = Math.ceil(Math.sqrt(numNeurons));
    const spacing = 0.3;

    const connections = useMemo(() => {
        const lines: any[] = [];
        const count = 20; // limit connections
        for (let i = 0; i < count; i++) {
            const startIdx = Math.floor(Math.random() * numNeurons);
            const endIdx = Math.floor(Math.random() * numNeurons);

            // Positions match logic in Layer component
            const sRow = Math.floor(startIdx / gridSize);
            const sCol = startIdx % gridSize;
            const startPos = new THREE.Vector3(
                (sCol - gridSize / 2) * spacing, (sRow - gridSize / 2) * spacing, layerIndex * 2
            );

            const eRow = Math.floor(endIdx / gridSize);
            const eCol = endIdx % gridSize;
            const endPos = new THREE.Vector3(
                (eCol - gridSize / 2) * spacing, (eRow - gridSize / 2) * spacing, (layerIndex + 1) * 2
            );

            lines.push({ start: startPos, end: endPos });
        }
        return lines;
    }, [layerIndex, numNeurons]);

    return (
        <group>
            {connections.map((c, i) => (
                <Line
                    key={i}
                    points={[c.start, c.end]}
                    color="white"
                    transparent
                    opacity={0.1}
                    lineWidth={1}
                />
            ))}
        </group>
    );
}


// --- Main Scene ---

const GlassBrainScene = ({ data, autoRotate = true }: { data?: GlassBoxData, autoRotate?: boolean }) => {
    const config = data?.config || MOCK_CONFIG;

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            <group position={[0, -1, -config.n_layers]}>
                {Array.from({ length: config.n_layers }).map((_, i) => (
                    <group key={i}>
                        <Layer
                            layerIndex={i}
                            numNeurons={config.d_model}
                        />
                        {i < config.n_layers - 1 && (
                            <Synapses layerIndex={i} numNeurons={config.d_model} />
                        )}
                    </group>
                ))}
            </group>

            <OrbitControls autoRotate={autoRotate} autoRotateSpeed={0.5} />
            <Environment preset="city" />
        </>
    );
};

// --- Exported Component ---

export const GlassBrain = ({ className = "" }: { className?: string }) => {
    return (
        <div className={`w-full h-[500px] bg-black rounded-xl overflow-hidden border border-border ${className}`}>
            <div className="absolute top-4 left-4 z-10 p-2 bg-black/50 backdrop-blur-md rounded border border-white/10 text-white">
                <h3 className="font-bold text-sm">Cortex-13 Neural Viz</h3>
                <p className="text-xs text-gray-400">Live Activation State (Simulated)</p>
            </div>
            <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
                <color attach="background" args={['#050505']} />
                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <GlassBrainScene />
                </Float>
            </Canvas>
        </div>
    );
};
