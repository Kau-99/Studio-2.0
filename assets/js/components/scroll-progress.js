import { onFrame } from '../utils/raf.js';

export function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress__bar');
  if (!bar) return;

  // scrollHeight é leitura de layout: mede sob demanda, não a cada frame.
  let docHeight = 0;
  const measureDoc = () => {
    docHeight = document.documentElement.scrollHeight - window.innerHeight;
  };
  measureDoc();
  window.addEventListener('resize', measureDoc, { passive: true });

  // <details> abrindo, imagens carregando e o banner de consentimento mudam a
  // altura do documento sem disparar resize — a barra ficaria mal escalada.
  if ('ResizeObserver' in window) {
    new ResizeObserver(measureDoc).observe(document.documentElement);
  }

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
