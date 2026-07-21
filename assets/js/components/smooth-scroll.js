import { onFrame, setScrollSource } from '../utils/raf.js';
import { prefersReducedMotion } from '../utils/helpers.js';

const LENIS_URL = 'https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.mjs';

/**
 * Carrega o Lenis como enriquecimento opcional.
 *
 * Falha do CDN, reduced-motion e dispositivos touch caem no scroll
 * nativo sem erro. Nunca rejeita — uma lib de 3KB não pode derrubar
 * o menu e os formulários junto.
 *
 * @returns {Promise<boolean>} true se o Lenis assumiu o scroll.
 */
export async function initSmoothScroll() {
  if (prefersReducedMotion()) return false;

  // Inércia em touch briga com o scroll nativo do sistema.
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return false;

  try {
    const { default: Lenis } = await import(LENIS_URL);

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 0,
    });

    // O Lenis alimenta o loop existente em vez de abrir o seu próprio rAF.
    onFrame(() => lenis.raf(performance.now()));
    setScrollSource(() => lenis.scroll);

    document.documentElement.classList.add('has-smooth-scroll');
    return true;
  } catch (err) {
    // CDN fora do ar, bloqueio de rede, CSP. O scroll nativo continua.
    console.warn('[smooth-scroll] Lenis indisponível, usando scroll nativo.', err);
    return false;
  }
}
