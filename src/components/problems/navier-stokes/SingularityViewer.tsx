import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import singularityData from '../../../data/navier_stokes_singularity.json';

// Tipos basados en tu JSON generado
type SingularityProfilePoint = {
    y_coord: number;
    vorticity: number;
    velocity: number;
};

const SingularityViewer: React.FC = () => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const [isPerturbed, setIsPerturbed] = useState(false);
    const [perturbationTime, setPerturbationTime] = useState(0);

    // 1. Procesar datos del JSON para crear una estructura 3D (Superficie de Revolución)
    const { count, transformData } = useMemo(() => {
        const profile = singularityData.profile as SingularityProfilePoint[];
        const radialSegments = 60; // Resolución angular
        const totalInstances = profile.length * radialSegments;

        const tempObject = new THREE.Object3D();
        const colorArray = new Float32Array(totalInstances * 3);
        const transforms: THREE.Matrix4[] = [];

        let instanceIdx = 0;

        profile.forEach((point) => {
            const radius = Math.abs(point.vorticity) * 0.5; // La vorticidad define el radio visual
            const y = point.y_coord;

            // Color basado en la magnitud de la vorticidad (Azul -> Rojo)
            const intensity = Math.min(Math.abs(point.vorticity) / 8.0, 1.0);
            const color = new THREE.Color().setHSL(0.6 - (intensity * 0.6), 1.0, 0.5);

            for (let i = 0; i < radialSegments; i++) {
                const theta = (i / radialSegments) * Math.PI * 2;
                const x = Math.cos(theta) * radius;
                const z = Math.sin(theta) * radius;

                // Posicionar partícula en el anillo
                tempObject.position.set(x, y, z);
                tempObject.rotation.y = -theta; // Orientar hacia el centro

                // Escalar según velocidad (visualizar vector)
                const scale = Math.max(0.1, Math.abs(point.velocity) * 0.2);
                tempObject.scale.set(scale, 0.1, 0.1);

                tempObject.updateMatrix();
                transforms.push(tempObject.matrix.clone());

                colorArray[instanceIdx * 3] = color.r;
                colorArray[instanceIdx * 3 + 1] = color.g;
                colorArray[instanceIdx * 3 + 2] = color.b;

                instanceIdx++;
            }
        });

        return { count: totalInstances, colorArray, transforms };
    }, []);

    // 2. Inicializar InstancedMesh
    useEffect(() => {
        if (meshRef.current) {
            transformData.transforms.forEach((matrix, i) => {
                meshRef.current!.setMatrixAt(i, matrix);
            });
            meshRef.current.instanceMatrix.needsUpdate = true;
            if (meshRef.current.instanceColor) {
                meshRef.current.instanceColor.array.set(transformData.colorArray);
                meshRef.current.instanceColor.needsUpdate = true;
            }
        }
    }, [transformData]);

    // 3. Loop de Animación: Simular Inestabilidad
    useFrame((state, delta) => {
        if (!meshRef.current) return;

        if (isPerturbed) {
            setPerturbationTime(prev => prev + delta);

            // Simulación visual de "Blow-up Inestable": Colapso exponencial
            const collapseRate = 2.0; // Velocidad de destrucción
            const t = perturbationTime;

            // Matriz temporal para actualizar posiciones
            const tempObj = new THREE.Object3D();

            for (let i = 0; i < count; i++) {
                meshRef.current.getMatrixAt(i, tempObj.matrix);
                tempObj.matrix.decompose(tempObj.position, tempObj.quaternion, tempObj.scale);

                // Añadir ruido caótico que crece exponencialmente (efecto mariposa)
                const noise = (Math.random() - 0.5) * Math.exp(t * collapseRate) * 0.1;

                tempObj.position.x += noise;
                tempObj.position.z += noise;
                tempObj.position.y += noise * 0.5;

                // Disipar la estructura (escalar a cero)
                const decay = Math.max(0, 1 - t * 0.5);
                tempObj.scale.multiplyScalar(decay);

                tempObj.updateMatrix();
                meshRef.current.setMatrixAt(i, tempObj.matrix);
            }
            meshRef.current.instanceMatrix.needsUpdate = true;
        } else {
            // Rotación suave "estable" cuando no hay perturbación
            meshRef.current.rotation.y += delta * 0.1;
        }
    });

    return (
        <group>
            <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
                <boxGeometry args={[1]} /> {/* Partículas como cubos/vectores */}
                <meshStandardMaterial toneMapped={false} />
            </instancedMesh>

            <Html position={[0, 2, 0]}>
                <div className="p-4 bg-black/80 text-white rounded-lg border border-red-500 w-80 backdrop-blur-md">
                    <h3 className="font-bold text-lg mb-2 text-red-500">Monitor de Singularidad</h3>
                    <div className="text-xs font-mono space-y-1">
                        <p>Tipo: <span className="text-red-400 font-bold underline">Inestable (Tipo II)</span></p>
                        <p>Lambda (λ): {singularityData.metadata.lambda_param}</p>
                        <p>Precisión: {singularityData.metadata.precision}</p>
                        <p className="mt-2 text-slate-300 leading-relaxed italic">
                            "Esta estructura requiere precisión infinita. Cualquier perturbación causará un fallo en la trayectoria de colapso."
                        </p>
                    </div>
                    <button
                        onClick={() => setIsPerturbed(true)}
                        disabled={isPerturbed}
                        className={`mt-4 w-full py-2 px-4 rounded font-bold transition-all ${isPerturbed
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                            }`}
                    >
                        {isPerturbed ? 'DECOHERENCIA EN CURSO...' : 'INTRODUCIR PERTURBACIÓN (ε)'}
                    </button>
                </div>
            </Html>
        </group>
    );
};

export default SingularityViewer;
