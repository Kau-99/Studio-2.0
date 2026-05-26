import { throttle } from '../utils/helpers.js';

export function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const SCROLL_THRESHOLD = 80;

  const updateHeader = throttle(() => {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;
    header.classList.toggle('scrolled', scrolled);
  }, 50);

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
}
