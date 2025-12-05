import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Text } from "@react-three/drei";
import * as THREE from "three";
import type { Points as ThreePoints } from "three";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

// Approximating Zeta Magnitude for visuals
// |zeta(0.5 + it)| is the critical line.
// We'll generate a terrain where x = real part, z = imaginary part (scaled), y = magnitude.
const ZetaTerrain = () => {
    const pointsRef = useRef<ThreePoints>(null);

    // Generate geometry data
    const { positions, colors } = useMemo(() => {
        const size = 60;
        const resolution = 60;
        const positions = [];
        const colors = [];
        const colorObj = new THREE.Color();

        for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
                // x maps to Real part: 0 to 1
                const x = (i / resolution);
                // z maps to Imaginary part: 0 to 50
                const z = (j / resolution) * 50;

                // Visualization Hack:
                // We want peaks at the "zeros" (actually valleys in log plot, but let's make them peaks for drama)
                // Or standard: Magnitude. 
                // Zeros are at t = 14.13, 21.02, 25.01...
                // Let's implement a fake visual function that looks like Zeta
                const criticalLineDist = Math.abs(x - 0.5);

                // Oscillatory component
                const osc = Math.cos(z * Math.log(z + 1) / 2);

                // Formulate "height"
                let y = (Math.exp(-criticalLineDist * 4) * (1 + osc)) * 2;
                if (z < 2) y = 5; // Pole at s=1 (approx)

                positions.push(x * 20 - 10, y, z - 25);

                // Color based on height (Gold for high, Blue for low)
                colorObj.setHSL(0.6 - (y / 5) * 0.5, 1, 0.5);
                colors.push(colorObj.r, colorObj.g, colorObj.b);
            }
        }
        return {
            positions: new Float32Array(positions),
            colors: new Float32Array(colors)
        };
    }, []);

    useFrame(() => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += 0.001;
        }
    });

    return (
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
                sizeAttenuation
                transparent
                opacity={0.8}
            />
        </points>
    );
};

const CriticalZeros = () => {
    // Known zeros: 14.13, 21.02, 25.01
    const zeros = [14.13, 21.02, 25.01, 30.42, 32.93, 37.58];

    return (
        <group position={[0, 0, -25]}>
            {zeros.map((z, i) => (
                <mesh key={i} position={[0, 1, z]}>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={2} />
                    <Text
                        position={[1, 0.5, 0]}
                        fontSize={0.5}
                        color="white"
                    >
                        {z.toFixed(2)}i
                    </Text>
                </mesh>
            ))}
            {/* The Critical Line */}
            <mesh position={[0, 0, 25]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.1, 60]} />
                <meshBasicMaterial color="#ef4444" opacity={0.5} transparent />
            </mesh>
        </group>
    );
};

export const ZetaLand = () => {
    const [audio, setAudio] = useState(false);

    return (
        <div className="relative w-full h-full min-h-[500px] bg-black rounded-xl overflow-hidden border border-white/10">
            <Canvas camera={{ position: [15, 10, 15], fov: 45 }}>
                <color attach="background" args={['#000']} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                <ZetaTerrain />
                <CriticalZeros />

                <OrbitControls autoRotate autoRotateSpeed={0.5} />
                <gridHelper args={[50, 50, 0x333333, 0x111111]} position={[0, -2, 0]} />
            </Canvas>

            <div className="absolute top-4 right-4 z-10">
                <Button
                    size="icon"
                    variant="outline"
                    className="bg-black/50 backdrop-blur border-white/20"
                    onClick={() => setAudio(!audio)}
                >
                    {audio ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4" />}
                </Button>
            </div>

            <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
                <h3 className="text-white font-mono font-bold text-lg">ζ(s) Landscape</h3>
                <p className="text-white/50 text-xs">Visualizing the Critical Strip (Re(s) ∈ [0, 1])</p>
            </div>
        </div>
    );
};
