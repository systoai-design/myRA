import { useState, useRef, useEffect } from "react";

interface SplashScreenProps {
    onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Attempt autoplay; if blocked, skip splash after timeout
        const video = videoRef.current;
        if (!video) return;

        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Autoplay is blocked (e.g. by browser policy), skip splash
                onComplete();
            });
        }

        // Safety timeout: if the video hasn't ended in 8s, force-finish
        const safetyTimer = setTimeout(() => {
            if (!fadeOut) {
                setFadeOut(true);
                setTimeout(onComplete, 600);
            }
        }, 8000);

        return () => clearTimeout(safetyTimer);
    }, []);

    const handleVideoEnd = () => {
        setFadeOut(true);
        // Wait for the CSS fade-out transition before unmounting
        setTimeout(onComplete, 600);
    };

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0e1a] transition-opacity duration-500 ${fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
        >
            <video
                ref={videoRef}
                src="/splash.mp4"
                muted
                playsInline
                onEnded={handleVideoEnd}
                className="w-full h-full object-contain"
            />
        </div>
    );
}
