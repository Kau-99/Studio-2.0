/**
 * Cortina de entrada.
 *
 * Emite `studio:curtain-up` quando termina de sair, para que o hero
 * revele depois da cortina e não atrás dela. O evento é garantido em
 * todos os caminhos: com cortina, sem cortina (404.html) e via rede de
 * segurança se `load` nunca chegar.
 */
export function initLoader() {
  let announced = false;

  const announce = () => {
    if (announced) return;
    announced = true;
    document.dispatchEvent(new CustomEvent('studio:curtain-up'));
  };

  const loader = document.querySelector('.page-loader');

  // Sem cortina (404.html), o hero pode revelar imediatamente.
  if (!loader) {
    announce();
    return;
  }

  const hide = () => {
    loader.classList.add('is-leaving');
    setTimeout(() => {
      loader.remove();
      announce();
    }, 600);
  };

  if (document.readyState === 'complete') {
    setTimeout(hide, 400);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 400));
  }

  // Rede de segurança: o CSS já esconde a cortina em 2500ms via
  // loaderFallback. Se `load` nunca disparar, o hero não pode ficar
  // preso esperando um evento que não vem. 3200ms > 2500ms de propósito.
  setTimeout(announce, 3200);
}
