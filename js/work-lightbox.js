const galleryImages = document.querySelectorAll(
  '.work-gallery-grid figure > img'
);

galleryImages.forEach((image) => {
  const trigger = document.createElement('a');
  const caption = image.closest('figure')?.querySelector('figcaption')?.textContent;

  trigger.href = image.getAttribute('src');
  trigger.dataset.lightbox = '';
  trigger.className = 'work-lightbox-trigger';
  trigger.setAttribute(
    'aria-label',
    `Expand ${caption?.trim() || image.alt || 'project image'}`
  );

  image.before(trigger);
  trigger.append(image);
});

if (galleryImages.length && !document.getElementById('lightbox')) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.id = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox__inner">
      <figure class="lightbox__content">
        <img alt="">
        <figcaption></figcaption>
      </figure>
    </div>
  `;
  document.body.append(lightbox);
}

if (galleryImages.length) {
  import('./lightbox.js');
}
