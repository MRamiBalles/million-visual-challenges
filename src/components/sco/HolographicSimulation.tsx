import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Layers } from 'lucide-react';

interface HolographicBoundaryProps {
  time: number;
  spaceUsed: number;
  isRunning: boolean;
}

// Boundary particles representing the holographic encoding
function BoundaryParticles({ time, spaceUsed }: { time: number; spaceUsed: number }) {
  const particlesRef = useRef<THREE.Points>(null);
  const count = Math.floor(Math.sqrt(time) * 10) + 50;
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Particles on a sphere boundary (holographic surface)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 2;
      
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
      
      // Color based on encoding density
      const intensity = 0.5 + Math.random() * 0.5;
      col[i * 3] = 0.4 * intensity;     // R
      col[i * 3 + 1] = 0.8 * intensity; // G
      col[i * 3 + 2] = 1.0 * intensity; // B
    }
    
    return [pos, col];
  }, [count]);
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// The "bulk" computation being replaced by boundary
function ComputationalBulk({ time, isRunning }: { time: number; isRunning: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const opacity = Math.max(0.1, 0.8 - (Math.sqrt(time) / 100));
  
  useFrame((state) => {
    if (meshRef.current && isRunning) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      // Shrink as boundary takes over
      const scale = Math.max(0.1, 1 - Math.sqrt(time) / 150);
      meshRef.current.scale.setScalar(scale);
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 2]} />
      <meshBasicMaterial
        color="#ff6b6b"
        transparent
        opacity={opacity}
        wireframe
      />
    </mesh>
  );
}

// Space complexity visualization
function SpaceGraph({ time, spaceUsed }: { time: number; spaceUsed: number }) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let t = 0; t <= time; t += Math.max(1, time / 50)) {
      const x = (t / 1000) * 3 - 1.5;
      const y = (Math.sqrt(t) / 32) * 2 - 1.5;
      pts.push([x, y, -2.5]);
    }
    return pts;
  }, [time]);
  
  if (points.length < 2) return null;
  
  return (
    <Line
      points={points}
      color="#00ff88"
      lineWidth={2}
    />
  );
}

function HolographicScene({ time, spaceUsed, isRunning }: HolographicBoundaryProps) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4488ff" />
      
      <BoundaryParticles time={time} spaceUsed={spaceUsed} />
      <ComputationalBulk time={time} isRunning={isRunning} />
      <SpaceGraph time={time} spaceUsed={spaceUsed} />
      
      {/* Axis labels */}
      <Text
        position={[0, -2.8, 0]}
        fontSize={0.15}
        color="#888"
      >
        O(√T) Space Simulation
      </Text>
      
      <OrbitControls 
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={8}
      />
    </>
  );
}

export function HolographicSimulation() {
  const [time, setTime] = useState(100);
  const [isRunning, setIsRunning] = useState(true);
  const [maxTime, setMaxTime] = useState(1000);
  
  const spaceUsed = Math.sqrt(time);
  const spaceRatio = (spaceUsed / time) * 100;
  
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setTime(prev => {
        const next = prev + 10;
        return next > maxTime ? 100 : next;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [isRunning, maxTime]);
  
  const reset = () => {
    setTime(100);
    setIsRunning(false);
  };
  
  return (
    <Card className="bg-black/40 border-emerald-500/30 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg flex items-center gap-2 text-emerald-300">
            <Layers className="w-5 h-5" />
            Holographic Motor (ARE)
          </CardTitle>
          <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            Williams/Nye 2025
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] rounded-lg overflow-hidden border border-emerald-500/20 mb-4">
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
            <HolographicScene time={time} spaceUsed={spaceUsed} isRunning={isRunning} />
          </Canvas>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3 mb-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsRunning(!isRunning)}
            className="border-emerald-500/30 hover:bg-emerald-500/20"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={reset}
            className="border-emerald-500/30 hover:bg-emerald-500/20"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Max T:</span>
            <Slider
              value={[maxTime]}
              onValueChange={(v) => setMaxTime(v[0])}
              min={500}
              max={5000}
              step={500}
              className="w-24"
            />
            <span className="text-xs text-emerald-400 font-mono">{maxTime}</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-black/30 rounded-lg p-2 border border-emerald-500/20">
            <div className="text-lg font-mono text-emerald-400">{time}</div>
            <div className="text-xs text-muted-foreground">Time (T)</div>
          </div>
          <div className="bg-black/30 rounded-lg p-2 border border-emerald-500/20">
            <div className="text-lg font-mono text-cyan-400">{spaceUsed.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Space (√T)</div>
          </div>
          <div className="bg-black/30 rounded-lg p-2 border border-emerald-500/20">
            <div className="text-lg font-mono text-yellow-400">{spaceRatio.toFixed(2)}%</div>
            <div className="text-xs text-muted-foreground">Compression</div>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Boundary particles encode full computation • Bulk redundancy demonstrated
        </p>
      </CardContent>
    </Card>
  );
}
