export function initMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav    = document.querySelector('.nav-mobile');

  if (!toggle || !nav) return;

  // If fallback already bound, skip to avoid double-toggle
  if (toggle.dataset.menuInit === '1') return;
  toggle.dataset.menuInit = '1';

  // Initial state: closed + inert
  nav.inert = true;
  nav.removeAttribute('aria-hidden');

  let isOpen = false;

  function open() {
    isOpen = true;
    toggle.classList.add('active');
    nav.classList.add('open');
    nav.inert = false;
    document.body.style.overflow = 'hidden';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');

    try {
      const firstLink = nav.querySelector('a');
      firstLink && firstLink.focus();
    } catch (e) { /* noop */ }
  }

  function close({ silent = false } = {}) {
    isOpen = false;
    toggle.classList.remove('active');
    nav.classList.remove('open');
    document.body.style.overflow = '';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');

    // Move focus OUT of nav BEFORE making it inert
    if (nav.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    nav.inert = true;

    // Only refocus toggle when user-initiated close (ESC or button), not navigation
    if (!silent) {
      try { toggle.focus(); } catch (e) { /* noop */ }
    }
  }

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    isOpen ? close() : open();
  });

  // Close on link click — silent so native navigation isn't disrupted
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => close({ silent: true }));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) close();
  });

  // Tab trap (keep focus inside menu when open)
  nav.addEventListener('keydown', (e) => {
    if (!isOpen || e.key !== 'Tab') return;

    const focusable = nav.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled])'
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Mark current page in nav
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-desktop a, .nav-mobile a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.setAttribute('aria-current', 'page');
    }
  });
}
