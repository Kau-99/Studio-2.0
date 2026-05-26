/* ============================================
   MENU FALLBACK — non-module, runs immediately
   Garantia que o menu mobile funciona mesmo se
   ES Modules / main.js falharem.
============================================ */
(function () {
  'use strict';

  function init() {
    var toggle = document.querySelector('.menu-toggle');
    var nav    = document.querySelector('.nav-mobile');

    if (!toggle || !nav) return;

    if (toggle.dataset.menuInit === '1') return;
    toggle.dataset.menuInit = '1';

    // Initial state: closed + inert (preserves a11y, no focus inside)
    nav.inert = true;
    nav.removeAttribute('aria-hidden');

    var isOpen = false;

    function open() {
      isOpen = true;
      toggle.classList.add('active');
      nav.classList.add('open');
      nav.inert = false;
      document.body.style.overflow = 'hidden';
      toggle.setAttribute('aria-expanded', 'true');
    }

    function close(opts) {
      opts = opts || {};
      isOpen = false;
      toggle.classList.remove('active');
      nav.classList.remove('open');
      document.body.style.overflow = '';
      toggle.setAttribute('aria-expanded', 'false');

      // Blur whatever is focused inside nav BEFORE making it inert
      if (nav.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      nav.inert = true;

      // Only refocus toggle if NOT closing for navigation
      if (!opts.silent) {
        try { toggle.focus(); } catch (e) { /* noop */ }
      }
    }

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      isOpen ? close() : open();
    });

    // Close on link click — silent (allow native navigation)
    var links = nav.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function () {
        close({ silent: true });
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
