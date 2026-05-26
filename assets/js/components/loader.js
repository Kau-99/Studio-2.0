export function initLoader() {
  const loader = document.querySelector('.page-loader');
  if (!loader) return;

  const hide = () => {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 600);
  };

  if (document.readyState === 'complete') {
    setTimeout(hide, 400);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 400));
  }
}
