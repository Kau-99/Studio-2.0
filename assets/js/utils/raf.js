/**
 * Loop requestAnimationFrame único do site.
 *
 * É o dono exclusivo do scroll: nenhum outro módulo deve chamar
 * addEventListener('scroll'). Centralizar evita que três listeners
 * disputem o main thread no mesmo gesto e permite separar leituras
 * de layout das escritas.
 */

const callbacks = new Set();
let running = false;
let rafId = null;

/** Origem do valor de scroll. O Lenis substitui via setScrollSource. */
let getScrollY = () => window.scrollY;

export function setScrollSource(fn) {
  if (typeof fn === 'function') getScrollY = fn;
}

function tick() {
  if (!callbacks.size) {
    running = false;
    rafId = null;
    return;
  }

  // Leitura de layout em lote, antes de qualquer escrita.
  const state = { scrollY: getScrollY(), viewportH: window.innerHeight };

  // Escritas.
  callbacks.forEach((cb) => cb(state));

  rafId = requestAnimationFrame(tick);
}

function start() {
  if (running) return;
  running = true;
  rafId = requestAnimationFrame(tick);
}

/**
 * Registra um callback executado a cada frame.
 * @returns {() => void} cancela o registro; o loop para sozinho ao esvaziar.
 */
export function onFrame(callback) {
  callbacks.add(callback);
  start();
  return () => {
    callbacks.delete(callback);
    if (!callbacks.size && rafId !== null) {
      cancelAnimationFrame(rafId);
      running = false;
      rafId = null;
    }
  };
}
