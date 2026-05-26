export function initCarousels() {
  document.querySelectorAll('.carousel').forEach(initCarousel);
}

function initCarousel(el) {
  const track    = el.querySelector('.carousel__track');
  const slides   = el.querySelectorAll('.carousel__slide');
  const prevBtn  = el.querySelector('.carousel__btn--prev');
  const nextBtn  = el.querySelector('.carousel__btn--next');
  const dotsEl   = el.querySelector('.carousel__dots');

  if (!track || !slides.length) return;

  let current    = 0;
  let autoTimer  = null;
  const total    = slides.length;
  const AUTO_DELAY = parseInt(el.dataset.autoplay, 10) || 0;

  // Build dots
  if (dotsEl) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = `carousel__dot${i === 0 ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
      dot.addEventListener('click', () => goto(i));
      dotsEl.appendChild(dot);
    });
  }

  function updateDots() {
    dotsEl?.querySelectorAll('.carousel__dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goto(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    slides.forEach((s, i) => s.setAttribute('aria-hidden', i !== current));
    updateDots();
  }

  prevBtn?.addEventListener('click', () => { goto(current - 1); resetAuto(); });
  nextBtn?.addEventListener('click', () => { goto(current + 1); resetAuto(); });

  // Keyboard
  el.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { goto(current - 1); resetAuto(); }
    if (e.key === 'ArrowRight') { goto(current + 1); resetAuto(); }
  });

  // Touch/swipe
  let startX = 0;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? goto(current + 1) : goto(current - 1); resetAuto(); }
  });

  function startAuto() {
    if (!AUTO_DELAY) return;
    autoTimer = setInterval(() => goto(current + 1), AUTO_DELAY);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  // Pause on hover/focus
  el.addEventListener('mouseenter', () => clearInterval(autoTimer));
  el.addEventListener('mouseleave', startAuto);
  el.addEventListener('focusin',    () => clearInterval(autoTimer));
  el.addEventListener('focusout',   startAuto);

  goto(0);
  startAuto();
}
