/**
 * Cortina de entrada.
 *
 * Emite `studio:curtain-up` quando termina de sair, para que o hero
 * revele depois da cortina e não atrás dela.
 */
export function initLoader() {
  const loader = document.querySelector('.page-loader');

  // Sem cortina (páginas internas), o hero revela imediatamente.
  if (!loader) {
    announce();
    return;
  }

  let announced = false;

  function announce() {
    if (announced) return;
    announced = true;
    document.dispatchEvent(new CustomEvent('studio:curtain-up'));
  }

  const hide = () => {
    loader.classList.add('hidden');
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
  // invisível esperando um evento que não vem.
  setTimeout(announce, 3200);
}
