import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { careerConstellationData, CareerNode } from '@/data/careers';
import { Card } from '@/components/ui/card';

const Node = ({ node, pos, onSelect, selected }: { node: CareerNode, pos: THREE.Vector3, onSelect: (n: CareerNode) => void, selected: boolean }) => {
    const isProblem = node.type === 'problem';
    const color = isProblem ? '#FFD700' : (selected ? '#00ff88' : '#0099ff');
    const scale = isProblem ? 1.5 : 1;

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <mesh position={pos} onClick={(e) => { e.stopPropagation(); onSelect(node); }}>
                <sphereGeometry args={[isProblem ? 0.3 : 0.15, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={selected ? 2 : 0.5}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>
            <Text
                position={[pos.x, pos.y + (isProblem ? 0.5 : 0.3), pos.z]}
                fontSize={isProblem ? 0.25 : 0.15}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.01}
                outlineColor="black"
            >
                {node.label}
            </Text>
        </Float>
    );
};

const Connection = ({ start, end }: { start: THREE.Vector3, end: THREE.Vector3 }) => {
    const points = useMemo(() => [start, end], [start, end]);
    return (
        <line>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={2}
                    array={new Float32Array([start.x, start.y, start.z, end.x, end.y, end.z])}
                    itemSize={3}
                />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
        </line>
    );
};

export const CareerGraph = () => {
    const [selectedNode, setSelectedNode] = useState<CareerNode | null>(null);

    // Layout calculation (simple force-like layout or predefined)
    const positions = useMemo(() => {
        const map = new Map<string, THREE.Vector3>();
        // Problems in center
        let pIdx = 0;
        const problems = careerConstellationData.filter(n => n.type === 'problem');
        const radius = 2;
        problems.forEach(p => {
            const angle = (pIdx / problems.length) * Math.PI * 2;
            map.set(p.id, new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
            pIdx++;
        });

        // Careers orbit around them
        careerConstellationData.filter(n => n.type === 'career').forEach((c, i) => {
            // Find connected problem
            const parentId = c.connections[0];
            const parentPos = map.get(parentId) || new THREE.Vector3(0, 0, 0);
            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 2 + 1
            ).normalize().multiplyScalar(2.5); // Distance from star

            map.set(c.id, parentPos.clone().add(offset));
        });
        return map;
    }, []);

    return (
        <div className="w-full h-[600px] relative bg-black/90 rounded-xl overflow-hidden border border-white/10">
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />

                {/* Nodes */}
                {careerConstellationData.map(node => (
                    <Node
                        key={node.id}
                        node={node}
                        pos={positions.get(node.id)!}
                        onSelect={setSelectedNode}
                        selected={selectedNode?.id === node.id}
                    />
                ))}

                {/* Connections */}
                {careerConstellationData.map(node =>
                    node.connections.map(targetId => {
                        const start = positions.get(node.id);
                        const end = positions.get(targetId);
                        if (start && end) return <Connection key={`${node.id}-${targetId}`} start={start} end={end} />;
                        return null;
                    })
                )}

                <fog attach="fog" args={['#000', 5, 20]} />
            </Canvas>

            {/* Overlay Info */}
            {selectedNode && (
                <div className="absolute bottom-4 left-4 z-10 animate-in slide-in-from-bottom">
                    <Card className="w-80 bg-black/80 backdrop-blur border-indigo-500/50 p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-white">{selectedNode.label}</h3>
                            <span className="text-xs bg-indigo-500 px-2 py-1 rounded text-white">{selectedNode.type.toUpperCase()}</span>
                        </div>
                        <p className="text-2xl font-mono text-green-400 mb-2">{selectedNode.salary}</p>
                        <p className="text-sm text-gray-400">{selectedNode.description}</p>
                    </Card>
                </div>
            )}

            <div className="absolute top-4 left-4 pointer-events-none">
                <h2 className="text-2xl font-bold text-white tracking-wider">CAREER CONSTELLATIONS</h2>
                <p className="text-sm text-gray-400">Explore the universe of opportunity.</p>
            </div>
        </div>
    );
};
