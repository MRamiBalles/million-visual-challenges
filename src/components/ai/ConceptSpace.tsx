import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";

const ConceptPoints = () => {
    const pointsRef = useRef<THREE.Points>(null);

    const { positions, colors, labels } = useMemo(() => {
        const count = 1000;
        const positions = [];
        const colors = [];
        const labels: { pos: [number, number, number], text: string }[] = [];
        const color = new THREE.Color();

        // Generate clusters
        // Cluster 1: Logic (Blue)
        // Cluster 2: Math (Cyan)
        // Cluster 3: Abstract (Purple)

        const clusters = [
            { center: [-5, -2, -5], color: '#3b82f6', name: 'Logic', spread: 3 },
            { center: [5, 2, 5], color: '#06b6d4', name: 'Number Theory', spread: 4 },
            { center: [0, 5, -2], color: '#a855f7', name: 'Abstract', spread: 2 },
        ];

        for (let i = 0; i < count; i++) {
            const cluster = clusters[Math.floor(Math.random() * clusters.length)];

            // Gaussian-ish random
            const x = cluster.center[0] + (Math.random() - 0.5) * cluster.spread * 2;
            const y = cluster.center[1] + (Math.random() - 0.5) * cluster.spread * 2;
            const z = cluster.center[2] + (Math.random() - 0.5) * cluster.spread * 2;

            positions.push(x, y, z);

            color.set(cluster.color);
            // Variation
            color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.2);
            colors.push(color.r, color.g, color.b);

            // Randomly label some points
            if (i % 100 === 0) {
                const concepts = [
                    "P=NP", "Prime", "Zeta", "Entropy", "Gradient",
                    "Tensor", "Manifold", "Proof", "Recursion", "Qubit"
                ];
                labels.push({
                    pos: [x, y, z],
                    text: concepts[Math.floor(Math.random() * concepts.length)]
                });
            }
        }

        return {
            positions: new Float32Array(positions),
            colors: new Float32Array(colors),
            labels
        };
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
        }
    });

    return (
        <group>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={positions.length / 3}
                        array={positions}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={colors.length / 3}
                        array={colors}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.15}
                    vertexColors
                    transparent
                    opacity={0.8}
                    sizeAttenuation
                    blending={THREE.AdditiveBlending}
                />
            </points>
            {labels.map((l, i) => (
                <Html key={i} position={l.pos} center distanceFactor={15}>
                    <div className="text-[10px] font-mono text-white/70 bg-black/50 px-1 rounded backdrop-blur-sm pointer-events-none whitespace-nowrap">
                        {l.text}
                    </div>
                </Html>
            ))}
        </group>
    );
};

export const ConceptSpace = ({ className }: { className?: string }) => {
    return (
        <div className={`bg-black relative ${className}`}>
            <Canvas camera={{ position: [0, 0, 20], fov: 50 }}>
                <color attach="background" args={['#050505']} />
                <OrbitControls autoRotate autoRotateSpeed={0.5} />
                <ConceptPoints />
                <gridHelper args={[30, 30, 0x222222, 0x111111]} position={[0, -5, 0]} />
            </Canvas>
            <div className="absolute top-4 left-4 pointer-events-none">
                <div className="text-xs font-mono text-white/50">PROJECTION: T-SNE</div>
                <div className="text-xs font-mono text-cyan-500">CLUSTERS: 3 DETECTED</div>
            </div>
        </div>
    );
};
