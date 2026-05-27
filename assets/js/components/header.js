import { throttle } from '../utils/helpers.js';

export function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const SCROLL_THRESHOLD = 80;
  const startsTransparent = header.classList.contains('transparent');

  const updateHeader = throttle(() => {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;
    header.classList.toggle('scrolled', scrolled);

    // On homepage: header starts transparent (over hero).
    // When scrolled, BG becomes light → logo/nav must switch back to dark colors.
    if (startsTransparent) {
      header.classList.toggle('transparent', !scrolled);
    }
  }, 50);

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
}
