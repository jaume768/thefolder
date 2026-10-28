import { useEffect, useRef, useState } from "react";

// Marca `inView` la primera vez que el elemento referenciado entra en el
// viewport, y se desconecta (no vuelve a disparar en scrolls posteriores).
// Respeta prefers-reduced-motion mostrando el contenido ya visible.
export default function useRevealOnView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, inView];
}
