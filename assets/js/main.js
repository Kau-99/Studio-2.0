import { initHeader }            from './components/header.js';
import { initMenu }              from './components/menu.js';
import { initScrollAnimations }  from './components/observer.js';
import { initCounters, initParallax } from './components/animations.js';
import { initCarousels }         from './components/carousel.js';
import { initForms }             from './components/forms.js';
import { initLoader }            from './components/loader.js';
import { initScrollProgress }    from './components/scroll-progress.js';
import { initConsentNotice }     from './components/consent-notice.js';
import { initSmoothScroll }      from './components/smooth-scroll.js';
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from './utils/constants.js';
import { formatWhatsAppLink }    from './utils/helpers.js';

document.documentElement.classList.remove('no-js');

initLoader();

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMenu();
  initScrollAnimations();
  initCounters();
  initParallax();
  initCarousels();
  initForms();
  initScrollProgress();
  initSmoothScroll();
  initConsentNotice();
  initWhatsApp();
});

function initWhatsApp() {
  document.querySelectorAll('.whatsapp-float, [data-whatsapp]').forEach((el) => {
    el.href = formatWhatsAppLink(WHATSAPP_NUMBER, WHATSAPP_MESSAGE);
  });
}
