import { create } from 'zustand';

interface UIState {
    scrollY: number;
    mouse: { x: number; y: number };
    activeSection: string;
    setScrollY: (y: number) => void;
    setMouse: (x: number, y: number) => void;
    setActiveSection: (section: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
    scrollY: 0,
    mouse: { x: 0, y: 0 },
    activeSection: 'hero',
    setScrollY: (y) => set({ scrollY: y }),
    setMouse: (x, y) => set({ mouse: { x, y } }),
    setActiveSection: (section) => set({ activeSection: section }),
}));
