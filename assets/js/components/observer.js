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
