import { prefersReducedMotion } from '../utils/helpers.js';

export function initScrollAnimations() {
  if (prefersReducedMotion()) return;

  const animateEls  = document.querySelectorAll('[data-animate]');
  const staggerEls  = document.querySelectorAll('[data-stagger]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  );

  animateEls.forEach((el) => observer.observe(el));
  staggerEls.forEach((el) => observer.observe(el));
}
