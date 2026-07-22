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
import { initHero }              from './components/hero.js';
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from './utils/constants.js';
import { formatWhatsAppLink }    from './utils/helpers.js';

document.documentElement.classList.remove('no-js');

// initHero ANTES de initLoader, de propósito: em páginas sem cortina o
// loader dispara studio:curtain-up sincronamente, e o hero precisa já
// estar escutando. Módulos são deferidos, então o DOM já existe aqui.
initHero();
initLoader();

/**
 * Cada init roda isolado: `no-js` já foi removido acima, então um init que
 * lance deixaria todo [data-animate] preso em opacity:0 — a página inteira
 * em branco por causa de um módulo. initScrollAnimations vem primeiro
 * justamente por ser o que revela o conteúdo.
 */
function run(nome, fn) {
  try {
    fn();
  } catch (err) {
    console.error(`[main] ${nome} falhou; o resto da página segue.`, err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  run('initScrollAnimations', initScrollAnimations);
  run('initHeader', initHeader);
  run('initMenu', initMenu);
  run('initCounters', initCounters);
  run('initParallax', initParallax);
  run('initCarousels', initCarousels);
  run('initForms', initForms);
  run('initScrollProgress', initScrollProgress);
  run('initSmoothScroll', initSmoothScroll);
  run('initConsentNotice', initConsentNotice);
  run('initWhatsApp', initWhatsApp);
});

function initWhatsApp() {
  document.querySelectorAll('.whatsapp-float, [data-whatsapp]').forEach((el) => {
    el.href = formatWhatsAppLink(WHATSAPP_NUMBER, WHATSAPP_MESSAGE);
  });
}
