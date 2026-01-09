import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export const MERARenormalization = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
        camera.position.z = 12;
        camera.position.y = 2;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        containerRef.current.appendChild(renderer.domElement);

        // MERA Structure (Binary Tree like)
        const layers = 5;
        const colorScale = [0x6366f1, 0x4f46e5, 0x4338ca, 0x3730a3, 0x312e81];

        const nodes: THREE.Group = new THREE.Group();
        const lines: THREE.Group = new THREE.Group();

        for (let l = 0; l < layers; l++) {
            const count = Math.pow(2, layers - l);
            const spacing = Math.pow(2, l);
            const y = l * 2.5;

            for (let i = 0; i < count; i++) {
                const x = (i - (count - 1) / 2) * spacing;

                // Node
                const sphere = new THREE.Mesh(
                    new THREE.SphereGeometry(0.15, 16, 16),
                    new THREE.MeshBasicMaterial({ color: colorScale[l] })
                );
                sphere.position.set(x, y, 0);
                nodes.add(sphere);

                // Connections to layer below
                if (l > 0) {
                    const prevCount = Math.pow(2, layers - (l - 1));
                    const prevSpacing = Math.pow(2, (l - 1));

                    // Each node in layer L connects to 2 nodes in layer L-1
                    const leftChildX = (i * 2 - (prevCount - 1) / 2) * prevSpacing;
                    const rightChildX = ((i * 2 + 1) - (prevCount - 1) / 2) * prevSpacing;

                    const points1 = [new THREE.Vector3(x, y, 0), new THREE.Vector3(leftChildX, y - 2.5, 0)];
                    const points2 = [new THREE.Vector3(x, y, 0), new THREE.Vector3(rightChildX, y - 2.5, 0)];

                    const line1 = new THREE.Line(
                        new THREE.BufferGeometry().setFromPoints(points1),
                        new THREE.LineBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.3 })
                    );
                    const line2 = new THREE.Line(
                        new THREE.BufferGeometry().setFromPoints(points2),
                        new THREE.LineBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.3 })
                    );
                    lines.add(line1, line2);
                }
            }
        }

        scene.add(nodes, lines);

        const animate = () => {
            requestAnimationFrame(animate);
            nodes.rotation.y += 0.005;
            lines.rotation.y += 0.005;
            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            if (!containerRef.current) return;
            camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={containerRef} className="w-full h-full" />;
};
