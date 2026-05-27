export function initForms() {
  document.querySelectorAll('form[data-validate]').forEach(initValidatedForm);
  document.querySelectorAll('form[data-newsletter]').forEach(initNewsletterForm);
  // Newsletter forms in footer that just have an input + button
  document.querySelectorAll('.footer__newsletter, .newsletter-form').forEach(wrap => {
    const form = wrap.closest('form');
    if (form && !form.dataset.newsletter && !form.dataset.validate) {
      form.addEventListener('submit', (e) => e.preventDefault());
    }
  });
  // Also prevent any naked <input>+<button> blocks from reloading the page
  document.querySelectorAll('.footer__newsletter button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const form = btn.closest('form');
      if (!form) e.preventDefault();
    });
  });
}

function initValidatedForm(form) {
  const inputs = form.querySelectorAll('[required], [data-validate-field]');

  inputs.forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.closest('.form-group')?.classList.contains('has-error')) {
        validateField(input);
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let valid = true;
    inputs.forEach((input) => {
      if (!validateField(input)) valid = false;
    });
    if (!valid) {
      const firstError = form.querySelector('.has-error input, .has-error textarea, .has-error select');
      firstError?.focus();
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    const successEl = form.querySelector('.form-success');
    const originalText = submitBtn?.textContent ?? '';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
    }

    try {
      // Simulate async submission (replace with real fetch)
      await new Promise((r) => setTimeout(r, 1200));
      form.reset();

      if (successEl) {
        successEl.classList.add('visible');
        setTimeout(() => successEl.classList.remove('visible'), 6000);
      }
    } catch (err) {
      // Could show error UI here
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText || 'Enviar Mensagem';
      }
    }
  });
}

function initNewsletterForm(form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const btn   = form.querySelector('button[type="submit"], button');
    if (!input || !input.value.trim()) {
      input?.focus();
      return;
    }

    const originalText = btn?.textContent ?? '';
    if (btn) { btn.disabled = true; btn.textContent = '...'; }

    try {
      // Replace with real newsletter integration
      await new Promise((r) => setTimeout(r, 800));
      input.value = '';
      if (btn) btn.textContent = '✓ Inscrito';
      setTimeout(() => { if (btn) btn.textContent = originalText || 'Assinar'; }, 2500);
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

function validateField(input) {
  const group = input.closest('.form-group');
  if (!group) return true;

  const errorEl = group.querySelector('.form-error');
  let errorMsg  = '';

  if (input.validity.valueMissing) {
    errorMsg = 'Este campo é obrigatório.';
  } else if (input.type === 'email' && input.validity.typeMismatch) {
    errorMsg = 'Por favor, insira um e-mail válido.';
  } else if (input.type === 'tel' && input.value) {
    const digits = input.value.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 13) {
      errorMsg = 'Por favor, insira um telefone válido com DDD.';
    }
  } else if (input.minLength > 0 && input.value.length < input.minLength) {
    errorMsg = `Mínimo de ${input.minLength} caracteres.`;
  }

  const hasError = !!errorMsg;
  group.classList.toggle('has-error', hasError);
  input.classList.toggle('error', hasError);
  if (errorEl) errorEl.textContent = errorMsg;

  return !hasError;
}
