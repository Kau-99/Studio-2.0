import { prefersReducedMotion } from '../utils/helpers.js';

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

  const els = document.querySelectorAll('[data-parallax]');
  if (!els.length) return;

  const onScroll = () => {
    els.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}
