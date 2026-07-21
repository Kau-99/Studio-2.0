import { onFrame } from '../utils/raf.js';

export function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const SCROLL_THRESHOLD = 80;
  const startsTransparent = header.classList.contains('transparent');

  // Só escreve no DOM quando o estado muda, não a 60fps.
  let wasScrolled = null;

  onFrame(({ scrollY }) => {
    const scrolled = scrollY > SCROLL_THRESHOLD;
    if (scrolled === wasScrolled) return;
    wasScrolled = scrolled;

    header.classList.toggle('scrolled', scrolled);

    // Na home o header começa transparente sobre o hero. Ao rolar, o fundo
    // clareia → logo e nav precisam voltar para as cores escuras.
    if (startsTransparent) header.classList.toggle('transparent', !scrolled);
  });
}
