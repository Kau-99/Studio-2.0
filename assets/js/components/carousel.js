export function initCarousels() {
  document.querySelectorAll('.carousel').forEach(initCarousel);
}

function initCarousel(el) {
  const track   = el.querySelector('.carousel__track');
  const slides  = el.querySelectorAll('.carousel__slide');
  const prevBtn = el.querySelector('.carousel__btn--prev');
  const nextBtn = el.querySelector('.carousel__btn--next');
  const dotsEl  = el.querySelector('.carousel__dots');

  if (!track || !slides.length) return;
  if (slides.length === 1) {
    // No need for controls or autoplay with single slide
    prevBtn?.style.setProperty('display', 'none');
    nextBtn?.style.setProperty('display', 'none');
    return;
  }

  let current   = 0;
  let autoTimer = null;
  const total   = slides.length;
  const AUTO_DELAY = parseInt(el.dataset.autoplay, 10) || 0;

  if (dotsEl) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type  = 'button';
      dot.className = `carousel__dot${i === 0 ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
      dot.addEventListener('click', () => { goto(i); resetAuto(); });
      dotsEl.appendChild(dot);
    });
  }

  function updateDots() {
    dotsEl?.querySelectorAll('.carousel__dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goto(index) {
    current = ((index % total) + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    slides.forEach((s, i) => {
      // Use inert for hidden slides — better a11y than aria-hidden
      if (i === current) {
        s.removeAttribute('inert');
      } else {
        s.setAttribute('inert', '');
      }
    });
    updateDots();
  }

  prevBtn?.addEventListener('click', () => { goto(current - 1); resetAuto(); });
  nextBtn?.addEventListener('click', () => { goto(current + 1); resetAuto(); });

  // Keyboard navigation only when carousel area is focused
  el.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goto(current - 1); resetAuto(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goto(current + 1); resetAuto(); }
  });

  // Touch swipe
  let startX = 0;
  let startY = 0;
  let isHorizontal = false;
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isHorizontal = false;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    // Detect direction once
    if (isHorizontal) return;
    const dx = Math.abs(e.touches[0].clientX - startX);
    const dy = Math.abs(e.touches[0].clientY - startY);
    if (dx > dy && dx > 10) isHorizontal = true;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!isHorizontal) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goto(current + 1) : goto(current - 1);
      resetAuto();
    }
  });

  function startAuto() {
    if (!AUTO_DELAY) return;
    clearInterval(autoTimer); // prevent duplicate timers
    autoTimer = setInterval(() => goto(current + 1), AUTO_DELAY);
  }

  function stopAuto() {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  function resetAuto() {
    stopAuto();
    startAuto();
  }

  // Pause interactions
  el.addEventListener('mouseenter', stopAuto);
  el.addEventListener('mouseleave', startAuto);
  el.addEventListener('focusin',    stopAuto);
  el.addEventListener('focusout',   startAuto);

  // Pause when tab is hidden (saves CPU/battery)
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopAuto() : startAuto();
  });

  goto(0);
  startAuto();
}
