import { throttle } from '../utils/helpers.js';

export function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress__bar');
  if (!bar) return;

  const update = throttle(() => {
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const percent    = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    bar.style.width  = `${Math.min(100, Math.max(0, percent))}%`;
  }, 16);

  window.addEventListener('scroll', update, { passive: true });
  update();
}
