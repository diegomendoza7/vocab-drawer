import { C } from "../theme.js";

/* Global CSS: fonts, the two keyframe animations, and the focus ring.
 * Extracted verbatim so the mobile and desktop shells emit identical markup —
 * the indentation inside the template literal is significant, it ends up in
 * the DOM. */
export default function GlobalStyles() {
  return (
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600;700&display=swap');
        .font-type { font-family: var(--vd-heading); }
        .font-serif { font-family: var(--vd-reading); }
        @keyframes stampIn { 0% { transform: scale(2.2) rotate(-10deg); opacity: 0; } 55% { transform: scale(0.92) rotate(4deg); opacity: 1; } 100% { transform: scale(1) rotate(-4deg); opacity: 1; } }
        .stamp { animation: stampIn 0.32s ease-out; }
        @keyframes shakeX { 0%,100% { transform: translateX(0);} 25% { transform: translateX(-6px);} 75% { transform: translateX(6px);} }
        .shake { animation: shakeX 0.28s ease-in-out; }
        @media (prefers-reduced-motion: reduce) { .stamp, .shake { animation: none !important; } }
        button:focus-visible, input:focus-visible, div[tabindex]:focus-visible { outline: 2px solid ${C.gold}; outline-offset: 2px; }
      `}</style>
  );
}
