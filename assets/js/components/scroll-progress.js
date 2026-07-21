import { onFrame } from '../utils/raf.js';

export function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress__bar');
  if (!bar) return;

  // scrollHeight é leitura de layout: mede uma vez, não a cada frame.
  let docHeight = 0;
  const measure = () => {
    docHeight = document.documentElement.scrollHeight - window.innerHeight;
  };
  measure();
  window.addEventListener('resize', measure, { passive: true });

  let last = -1;

  onFrame(({ scrollY }) => {
    const ratio = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;
    // Duas casas bastam para 1px em telas largas; evita escrita redundante.
    const next = Math.round(ratio * 1000) / 1000;
    if (next === last) return;
    last = next;
    bar.style.transform = `scaleX(${next})`;
  });
}
