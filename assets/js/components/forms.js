export function initForms() {
  document.querySelectorAll('form[data-validate]').forEach(initForm);
}

function initForm(form) {
  const inputs = form.querySelectorAll('[required], [data-validate-field]');

  // Real-time validation on blur
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

    if (!valid) return;

    const submitBtn = form.querySelector('[type="submit"]');
    const successEl = form.querySelector('.form-success');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    // Simulate async submission (replace with real fetch)
    await new Promise((r) => setTimeout(r, 1200));

    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar Mensagem';
    form.reset();

    if (successEl) {
      successEl.classList.add('visible');
      setTimeout(() => successEl.classList.remove('visible'), 6000);
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
  } else if (input.type === 'tel' && input.value && !/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/.test(input.value)) {
    errorMsg = 'Por favor, insira um telefone válido.';
  } else if (input.minLength > 0 && input.value.length < input.minLength) {
    errorMsg = `Mínimo de ${input.minLength} caracteres.`;
  }

  const hasError = !!errorMsg;
  group.classList.toggle('has-error', hasError);
  input.classList.toggle('error', hasError);
  if (errorEl) errorEl.textContent = errorMsg;

  return !hasError;
}
