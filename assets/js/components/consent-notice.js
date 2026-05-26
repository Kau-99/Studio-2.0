const STORAGE_KEY = 'stv_consent';

export function initConsentNotice() {
  const banner = document.querySelector('.consent-notice');
  if (!banner) return;

  if (localStorage.getItem(STORAGE_KEY)) {
    banner.remove();
    return;
  }

  setTimeout(() => banner.classList.add('visible'), 1200);

  banner.querySelector('[data-consent-accept]')?.addEventListener('click', () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    dismiss();
  });

  banner.querySelector('[data-consent-decline]')?.addEventListener('click', () => {
    localStorage.setItem(STORAGE_KEY, 'declined');
    dismiss();
  });

  function dismiss() {
    banner.classList.remove('visible');
    setTimeout(() => banner.remove(), 500);
  }
}
