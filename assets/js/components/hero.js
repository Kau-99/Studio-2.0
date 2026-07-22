import { prefersReducedMotion } from '../utils/helpers.js';

/**
 * Orquestra a revelação do hero.
 *
 * Espera `studio:curtain-up` para que o título entre depois da cortina,
 * não atrás dela — a entrada mais cara do site não pode ser gasta onde
 * ninguém vê. Sob reduced-motion revela na hora; o CSS já anula as
 * transições e fornece o estado final estático.
 */
export function initHero() {
  const hero = document.querySelector('.hero--cinematic');
  if (!hero) return;

  const reveal = () => hero.classList.add('is-revealed');

  if (prefersReducedMotion()) {
    reveal();
    return;
  }

  document.addEventListener('studio:curtain-up', reveal, { once: true });

  // Rede de segurança: se o evento não chegar (loader removido, JS
  // parcialmente falho), o hero não pode ficar invisível esperando.
  setTimeout(reveal, 3500);
}
