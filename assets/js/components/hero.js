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

  initHeroVideo(hero);

  if (prefersReducedMotion()) {
    reveal();
    return;
  }

  document.addEventListener('studio:curtain-up', reveal, { once: true });

  // Rede de segurança: se o evento não chegar (loader removido, JS
  // parcialmente falho), o hero não pode ficar invisível esperando.
  setTimeout(reveal, 3500);
}

/**
 * Ativa o vídeo de fundo. A <img> permanece como poster e como LCP.
 *
 * Opt-in por markup: só age se o elemento tiver `data-hero-video`. Sem o
 * atributo não há requisição nenhuma — nem sonda. Uma versão anterior
 * fazia HEAD para autodetectar o arquivo, mas o browser loga o 404 no
 * console independentemente do catch, ou seja, a sonda reintroduzia
 * justamente o ruído que o atributo data- existia para evitar.
 *
 * Para ativar: coloque o arquivo em assets/images/hero/ e acrescente
 * data-hero-video="assets/images/hero/hero.mp4" ao <video> do hero.
 */
function initHeroVideo(hero) {
  if (prefersReducedMotion()) return;

  const video = hero.querySelector('[data-hero-video]');
  const src = video?.dataset.heroVideo;
  if (!src) return;

  video.src = src;

  Promise.resolve(video.play())
    .then(() => video.classList.add('is-playing'))
    .catch(() => {
      /* Autoplay bloqueado ou arquivo ilegível. O poster basta. */
    });
}
