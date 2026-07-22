import { prefersReducedMotion } from '../utils/helpers.js';

export function initScrollAnimations() {
  const animateEls = document.querySelectorAll('[data-animate]');
  const staggerEls = document.querySelectorAll('[data-stagger]');

  // If user prefers reduced motion, show everything instantly (CSS handles transition removal)
  if (prefersReducedMotion()) {
    animateEls.forEach((el) => el.classList.add('is-visible'));
    staggerEls.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // Fallback for browsers without IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    animateEls.forEach((el) => el.classList.add('is-visible'));
    staggerEls.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;

          if (el.hasAttribute('data-stagger')) {
            const children = Array.from(el.children);
            // No mobile o stagger é mais curto — a tela é menor e a espera
            // incomoda mais. Escalado aqui porque o delay é escrito inline e
            // venceria qualquer regra de media query no CSS.
            const mobile = window.matchMedia('(max-width: 767px)').matches;
            const step = mobile ? 60 : 90; // ms
            const maxSpan = mobile ? 300 : 600; // teto do span total
            const span = Math.min(step * children.length, maxSpan);
            children.forEach((child, i) => {
              // Ease no delay: os primeiros entram mais juntos, a cauda alonga.
              const t = i / Math.max(1, children.length - 1);
              const eased = t * t * (3 - 2 * t); // smoothstep
              child.style.transitionDelay = `${Math.round(eased * span)}ms`;
            });
          }

          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  );

  animateEls.forEach((el) => observer.observe(el));
  staggerEls.forEach((el) => observer.observe(el));
}
