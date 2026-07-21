/**
 * Loop requestAnimationFrame único do site.
 *
 * É o dono exclusivo do scroll: nenhum outro módulo deve chamar
 * addEventListener('scroll'). Centralizar evita que vários listeners
 * disputem o main thread no mesmo gesto.
 *
 * Cada frame roda em duas fases, e essa separação é a razão de o módulo
 * existir: TODAS as leituras de layout acontecem antes de QUALQUER escrita.
 * Sem isso, a escrita de um módulo invalida o layout e força recálculo na
 * leitura do módulo seguinte — o thrashing que queremos eliminar.
 */

const handlers = new Set();
let running = false;
let rafId = null;

/** Origem do valor de scroll. O Lenis substitui via setScrollSource. */
let getScrollY = () => window.scrollY;

export function setScrollSource(fn) {
  if (typeof fn === 'function') getScrollY = fn;
}

function stop() {
  running = false;
  rafId = null;
}

function tick() {
  if (!handlers.size) {
    stop();
    return;
  }

  const state = { scrollY: getScrollY(), viewportH: window.innerHeight };

  // Um handler que lança é removido do loop em vez de derrubá-lo — e em vez
  // de repetir o mesmo erro 60 vezes por segundo no console.
  const failed = new Map();
  const measured = new Map();

  // Fase 1 — leituras. Nenhuma escrita pode acontecer aqui.
  handlers.forEach((h) => {
    if (!h.measure) return;
    try {
      measured.set(h, h.measure(state));
    } catch (err) {
      failed.set(h, err);
    }
  });

  // Fase 2 — escritas.
  handlers.forEach((h) => {
    if (!h.mutate || failed.has(h)) return;
    try {
      h.mutate(measured.get(h), state);
    } catch (err) {
      failed.set(h, err);
    }
  });

  failed.forEach((err, h) => {
    handlers.delete(h);
    console.error('[raf] handler removido após erro; o resto do loop segue.', err);
  });

  // Um handler pode ter se desregistrado durante o frame. Reconferir antes de
  // reagendar, senão sobra um frame pendente com running=false e o próximo
  // registro abre um segundo loop em paralelo.
  if (!handlers.size) {
    stop();
    return;
  }

  rafId = requestAnimationFrame(tick);
}

function start() {
  if (running) return;
  running = true;
  rafId = requestAnimationFrame(tick);
}

/**
 * Registra trabalho por frame.
 *
 * @param {Function|{measure?: Function, mutate?: Function}} handler
 *   Uma função simples é tratada como escrita pura (fase 2) — é o caso de
 *   quem não lê layout. Quem lê layout DEVE usar a forma de objeto, pondo
 *   as leituras em `measure` e as escritas em `mutate`; o valor retornado
 *   por `measure` chega como primeiro argumento de `mutate`.
 * @returns {() => void} cancela o registro.
 */
export function onFrame(handler) {
  const entry = typeof handler === 'function' ? { mutate: handler } : handler;
  handlers.add(entry);
  start();
  return () => {
    handlers.delete(entry);
    if (!handlers.size && rafId !== null) {
      cancelAnimationFrame(rafId);
      stop();
    }
  };
}
