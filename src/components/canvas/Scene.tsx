import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { Suspense, useEffect } from 'react';
import MyRAAvatar from './MyRAAvatar';
import { useUIStore } from '@/store/useUIStore';

export default function Scene() {
    const setMouse = useUIStore((state) => state.setMouse);
    const setScrollY = useUIStore((state) => state.setScrollY);

    // Track DOM state to pass to WebGL via Zustand
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Normalize mouse coordinates to -1 to 1
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = -(e.clientY / window.innerHeight) * 2 + 1;
            setMouse(x, y);
        };

        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [setMouse, setScrollY]);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                dpr={[1, 2]} // Support high-DPI displays
                gl={{ powerPreference: "high-performance", antialias: false }}
            >
                <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
                    <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#00ffcc" />

                    <MyRAAvatar />

                    <Environment preset="city" />

                    <ContactShadows
                        position={[0, -2, 0]}
                        opacity={0.4}
                        scale={10}
                        blur={2}
                        far={4}
                        color="#00ffcc"
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
