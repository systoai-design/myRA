import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useUIStore } from '@/store/useUIStore';

export default function MyRAAvatar() {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<any>(null);
    const { viewport } = useThree();
    const mouse = useUIStore((state) => state.mouse);
    const scrollY = useUIStore((state) => state.scrollY);

    // Responsive sizing based on viewport
    const scale = useMemo(() => {
        return Math.min(viewport.width / 4, 2.5);
    }, [viewport.width]);

    useFrame((state, delta) => {
        if (!meshRef.current || !materialRef.current) return;

        // 1. Antigravity Physics: Lerp position based on mouse & scroll
        // The avatar follows the mouse slightly, but resists 1:1 motion
        const targetX = (mouse.x * viewport.width) / 10;
        const targetY = -(mouse.y * viewport.height) / 10 + Math.sin(state.clock.elapsedTime) * 0.1;

        // We also want the sphere to float upwards slightly as the user scrolls down
        const scrollOffset = scrollY * 0.005;

        meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 2 * delta);
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY + scrollOffset, 2 * delta);

        // 2. Perpetual Micro-motion: Distort material speed & factor
        // Morph the sphere slightly based on time to make it feel alive
        materialRef.current.distort = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        meshRef.current.rotation.x += delta * 0.2;
        meshRef.current.rotation.y += delta * 0.3;
    });

    return (
        <Float
            speed={2} // Animation speed, defaults to 1
            rotationIntensity={1} // XYZ rotation intensity, defaults to 1
            floatIntensity={1} // Up/down float intensity, works like a multiplier with floatingRange,defaults to 1
            floatingRange={[-0.1, 0.1]} // Range of y-axis values the object will float within, defaults to [-0.1,0.1]
        >
            <Sphere ref={meshRef} args={[1, 64, 64]} scale={scale} position={[0, 0, 0]}>
                <MeshDistortMaterial
                    ref={materialRef}
                    color="#0f52ba" // Sapphire Blue
                    emissive="#00ffcc" // Emerald Glow
                    emissiveIntensity={0.4}
                    envMapIntensity={1}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    metalness={0.8}
                    roughness={0.2}
                    speed={2}
                    distort={0.4}
                />
            </Sphere>
        </Float>
    );
}
