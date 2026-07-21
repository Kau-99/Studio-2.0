import { onFrame, setScrollSource } from '../utils/raf.js';
import { prefersReducedMotion } from '../utils/helpers.js';

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
    const { default: Lenis } = await import('../vendor/lenis.mjs');

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 0,
    });

    // O Lenis alimenta o loop existente em vez de abrir o seu próprio rAF.
    // Auto-curativo: se lenis.raf() lançar, o isolamento de falha do raf.js
    // removeria só o handler, mas setScrollSource continuaria apontando para
    // o Lenis e o wheel nativo seguiria suprimido — scroll congelado no site
    // inteiro. Em erro, desmonta o Lenis e devolve o scroll ao nativo.
    let stop = null;
    const teardown = () => {
      if (stop) stop();                          // sai do loop rAF
      setScrollSource(() => window.scrollY);      // devolve a origem do scroll ao nativo
      document.documentElement.classList.remove('has-smooth-scroll');
      try { lenis.destroy(); } catch { /* já morto */ }  // remove os listeners que faziam preventDefault
    };

    stop = onFrame(() => {
      try {
        lenis.raf(performance.now());
      } catch (err) {
        console.warn('[smooth-scroll] Lenis falhou em runtime; revertendo para scroll nativo.', err);
        teardown();
      }
    });

    setScrollSource(() => lenis.scroll);
    document.documentElement.classList.add('has-smooth-scroll');
    return true;
  } catch (err) {
    // CDN fora do ar, bloqueio de rede, CSP. O scroll nativo continua.
    console.warn('[smooth-scroll] Lenis indisponível, usando scroll nativo.', err);
    return false;
  }
}
