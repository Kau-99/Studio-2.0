import { prefersReducedMotion } from '../utils/helpers.js';
import { onFrame } from '../utils/raf.js';

export function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const end   = parseInt(el.dataset.counter, 10);
      const dur   = prefersReducedMotion() ? 0 : 1800;
      const step  = dur / end;
      let current = 0;

      const tick = () => {
        current = Math.min(current + Math.ceil(end / 60), end);
        el.textContent = current.toLocaleString('pt-BR');
        if (current < end) setTimeout(tick, step);
      };

      tick();
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => observer.observe(el));
}

export function initParallax() {
  if (prefersReducedMotion()) return;

  const els = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!els.length) return;

  // Só os elementos em viewport entram no loop.
  const active = new Set();

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) active.add(entry.target);
        else active.delete(entry.target);
      });
    },
    { rootMargin: '15% 0px' }
  );

  els.forEach((el) => io.observe(el));

  onFrame(({ viewportH }) => {
    if (!active.size) return;

    // Leituras primeiro, todas juntas.
    const reads = [];
    active.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      reads.push({ el, offset: (rect.top + rect.height / 2 - viewportH / 2) * speed });
    });

    // Escritas depois, todas juntas.
    for (const { el, offset } of reads) {
      el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    }
  });
}
