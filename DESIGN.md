# Design System: Retirement Architects
**Project Concept:** Premium AI-Driven Retirement Planning

## 1. Visual Theme & Atmosphere
The aesthetic is **"Futuristic Luxury"**—combining deep, dark backgrounds with vibrant, glowy interactive elements. It utilizes high-transparency glassmorphism and subtle micro-animations to create a sense of depth and intelligence.

## 2. Color Palette & Roles
The system uses a highly semantic HSL-based palette that shifts gracefully between light and dark modes.

*   **Primary Blue (hsl(221, 83%, 53%))**: The core brand color. Used for primary buttons, active states, and brand-critical highlights.
*   **Accent Cyan (hsl(199, 89%, 48%))**: Used for secondary interactive elements, success indicators, and complementary gradients.
*   **Deep Obsidian (hsl(222.2, 84%, 4.9%))**: The primary background for dark mode, providing a high-contrast base for "glowy" UI elements.
*   **Glass Surface (rgba(255, 255, 255, 0.05-0.1))**: Used for containers and cards to create a layered "frosted glass" effect over backgrounds.

## 3. Typography Rules
*   **Headings (Outfit)**: Used for all headers (H1-H6). Characterized by high-contrast weights (Bold) and tight letter-spacing (`tracking-tight`).
*   **Body (Inter)**: Used for all UI labels, paragraphs, and functional text. Optimized for high legibility at all scales.

## 4. Component Stylings
*   **Buttons**: Generously rounded (`radius: 1.25rem`). Use vibrant gradients or high-saturation solid HSL values. Hover states should include subtle scale-up or glow effects.
*   **Cards (Glassmorphism)**: Defined by `backdrop-blur-xl` and subtle `1px` white borders at low opacity (10-20%). They should appear to "float" above the background mesh.
*   **Inputs**: Minimalist with subtle border-bottom or full glass-style backgrounds. Focus states must use the `--ring` color.

## 5. Motion & Interaction
*   **Float**: Subtle vertical translation (`-10px`) for hero elements and decorative meshes.
*   **Glance**: High-speed, low-opacity shine animations for "premium" glass containers.
*   **Transitions**: All state changes should use a "smooth spring" feel (`0.2s ease-out`).
