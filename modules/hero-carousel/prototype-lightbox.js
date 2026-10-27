const dialog = document.querySelector('[data-prototype-lightbox]');
if (dialog) {
  let opener;
  document.querySelectorAll('[data-preview-design-lightbox]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      opener = link;
      dialog.showModal();
    });
  });
  dialog.querySelector('[data-prototype-lightbox-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus({ preventScroll: true }));
}
