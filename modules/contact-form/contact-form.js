const dialog = document.querySelector('[data-contact-dialog]');
if (dialog) {
  const form = dialog.querySelector('form');
  const fields = dialog.querySelector('[data-contact-fields]');
  const confirmation = dialog.querySelector('[data-contact-confirmation]');
  const error = dialog.querySelector('[data-contact-error]');
  const submit = form.querySelector('[type="submit"]');
  let opener;
  let sending = false;
  document.querySelectorAll('[data-contact-open]').forEach(button => button.addEventListener('click', () => {
    opener = button;
    if (!sending) {
      fields.hidden = false;
      confirmation.hidden = true;
      error.textContent = '';
      dialog.setAttribute('aria-labelledby', 'contact-heading');
    }
    dialog.showModal();
    dialog.querySelector('#contact-name').focus();
  }));
  dialog.querySelectorAll('[data-contact-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus({ preventScroll: true }));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    sending = true;
    submit.disabled = true;
    submit.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    error.textContent = '';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success !== true) throw new Error(result?.error || 'Your email could not be sent. Please try again or email hello@angelawallace.net directly.');
      fields.hidden = true;
      confirmation.hidden = false;
      dialog.setAttribute('aria-labelledby', 'contact-confirmation-heading');
      form.reset();
      if (dialog.open) confirmation.querySelector('h2').focus();
    } catch (failure) {
      error.textContent = failure.message;
    } finally {
      sending = false;
      submit.disabled = false;
      submit.textContent = 'Send email →';
      form.removeAttribute('aria-busy');
    }
  });
}
