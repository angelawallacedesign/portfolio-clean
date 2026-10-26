export function buildUpdateRequest(email) {
  const subject = 'Design Inspector updates';
  const body = `Hi Angela,\n\nI'd like to be notified of Design Inspector updates.\n\nMy email: ${email}\n\nThank you!`;
  return `mailto:hello@angelawallace.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

if (typeof document !== 'undefined') {
  const form = document.querySelector('[data-notify-form]');
  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const email = form.elements.namedItem('email').value.trim();
    document.querySelector('[data-notify-status]').textContent = 'Your email app will open. Send the message to request updates.';
    window.location.href = buildUpdateRequest(email);
  });
}
